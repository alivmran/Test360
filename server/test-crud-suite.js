import http from 'http';
import path from 'path';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { createApp } from './src/app.js';
import { env } from './src/config/env.js';
import { connectDatabase, disconnectDatabase } from './src/config/database.js';
import { User } from './src/modules/auth/user.model.js';
import { Repository } from './src/modules/repositories/repository.model.js';
import { PullRequestRun } from './src/modules/pull-requests/pr-run.model.js';
import { AstCallGraph } from './src/modules/ast-analysis/ast.model.js';
import { TestMatrix } from './src/modules/test-synthesis/test-spec.model.js';

async function runCrudVerification() {
  console.log('====================================================');
  console.log(' [1] VERIFYING DATABASE CONNECTION');
  console.log('====================================================');

  await connectDatabase();
  const readyState = mongoose.connection.readyState;
  console.log(`Mongoose readyState: ${readyState} (1 = connected)`);
  if (readyState !== 1) {
    throw new Error('Database is NOT connected! Cannot proceed with CRUD verification.');
  }
  console.log(`Connected to host: ${mongoose.connection.host}`);
  console.log(`Connected to database name: ${mongoose.connection.name}`);
  console.log(' Database connection verified successfully.\n');

  // Start express server on ephemeral test port
  const app = createApp();
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/api`;
  console.log(`Ephemeral test server listening on ${baseUrl}\n`);

  let testPassed = 0;
  let testFailed = 0;

  const assert = (condition, msg) => {
    if (condition) {
      console.log(`  PASSED: ${msg}`);
      testPassed++;
    } else {
      console.error(`  FAILED: ${msg}`);
      testFailed++;
    }
  };

  try {
    console.log('====================================================');
    console.log(' [2] TESTING HEALTH & DATABASE STATUS ENDPOINT');
    console.log('====================================================');
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200, 'Health endpoint responds 200 OK');
    assert(healthData.status === 'healthy', 'Health status reports healthy');
    console.log('Health Response:', JSON.stringify(healthData, null, 2));

    console.log('\n====================================================');
    console.log(' [3] TESTING USER / AUTH CRUD OPERATIONS');
    console.log('====================================================');
    const testEmail = `test_crud_${Date.now()}@example.com`;
    let createdUserId = null;

    // 3.1 CREATE USER
    const registerRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Automated Test User',
        email: testEmail,
        password: 'securepassword123',
        githubUsername: 'test-crud-bot',
        role: 'developer',
        organization: 'Test360 CI',
        bio: 'Created by automated test suite',
      }),
    });
    const registerData = await registerRes.json();
    assert(registerRes.status === 201, 'User registered with status 201');
    assert(registerData.requiresVerification === true, 'Registration requires email OTP verification');
    assert(!registerData.token, 'Unverified registration does not issue session token yet');
    assert(registerData.user?.email === testEmail, 'Created user has correct email');
    createdUserId = registerData.user?._id;
    console.log(`  Created User ID: ${createdUserId}`);

    // Confirm unverified user cannot sign in yet
    const unverifiedLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'securepassword123',
      }),
    });
    const unverifiedLoginData = await unverifiedLoginRes.json();
    assert(unverifiedLoginRes.status === 403, 'Unverified login rejected with 403');
    assert(unverifiedLoginData.requiresVerification === true, 'Unverified login flags requiresVerification');

    // Verify invalid OTP rejection and valid OTP acceptance
    const badVerifyRes = await fetch(`${baseUrl}/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, code: '000000' }),
    });
    assert(badVerifyRes.status === 400, 'Wrong email OTP rejected with 400');

    const knownTestOtp = '654321';
    const knownOtpHash = crypto.createHash('sha256').update(knownTestOtp).digest('hex');
    await User.findByIdAndUpdate(createdUserId, {
      emailVerificationCodeHash: knownOtpHash,
      emailVerificationExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    const verifyEmailRes = await fetch(`${baseUrl}/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, code: knownTestOtp }),
    });
    const verifyEmailData = await verifyEmailRes.json();
    assert(verifyEmailRes.status === 200, 'Valid email OTP verified with 200');
    assert(Boolean(verifyEmailData.token) && verifyEmailData.user?.isEmailVerified === true, 'Verification marks user verified and returns session token');

    // 3.2 READ USERS (LIST)
    const listUsersRes = await fetch(`${baseUrl}/auth/users`);
    const listUsersData = await listUsersRes.json();
    assert(listUsersRes.status === 200, 'List users returns 200');
    assert(
      Array.isArray(listUsersData.users) && listUsersData.users.some((u) => u._id === createdUserId),
      'Created user appears in listUsers result'
    );

    // 3.3 READ SINGLE USER (GET PROFILE)
    const getProfileRes = await fetch(`${baseUrl}/auth/profile/${createdUserId}`);
    const getProfileData = await getProfileRes.json();
    assert(getProfileRes.status === 200, 'Get user profile returns 200');
    assert(getProfileData.user?.name === 'Automated Test User', 'Fetched user profile matches name');

    // 3.4 LOGIN USER & SESSION TOKEN VERIFICATION
    const badLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'wrongpassword',
      }),
    });
    assert(badLoginRes.status === 401, 'Invalid password rejected with 401');

    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'securepassword123',
      }),
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200, 'Login succeeds with status 200');
    assert(loginData.token && loginData.user?.email === testEmail, 'Login returns token and user');

    const meRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${loginData.token}` },
    });
    const meData = await meRes.json();
    assert(meRes.status === 200, 'GET /auth/me returns 200 for valid Bearer token');
    assert(meData.user?.email === testEmail, 'GET /auth/me resolves correct user');

    const unauthMeRes = await fetch(`${baseUrl}/auth/me`);
    assert(unauthMeRes.status === 401, 'GET /auth/me rejects missing token with 401');

    // 3.5 UPDATE USER (UPDATE PROFILE)
    const updateProfileRes = await fetch(`${baseUrl}/auth/profile/${createdUserId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Updated Test User Name',
        bio: 'Updated bio content via CRUD test',
        role: 'reviewer',
      }),
    });
    const updateProfileData = await updateProfileRes.json();
    assert(updateProfileRes.status === 200, 'Update profile returns 200');
    assert(updateProfileData.user?.name === 'Updated Test User Name', 'User name updated in MongoDB');
    assert(updateProfileData.user?.role === 'reviewer', 'User role updated in MongoDB');

    // 3.6 DELETE USER
    const deleteUserRes = await fetch(`${baseUrl}/auth/profile/${createdUserId}`, {
      method: 'DELETE',
    });
    const deleteUserData = await deleteUserRes.json();
    assert(deleteUserRes.status === 200, 'Delete user returns 200');
    assert(deleteUserData.success === true, 'Delete user confirmed success');

    // Verify user is gone from MongoDB
    const verifyUserGone = await User.findById(createdUserId);
    assert(verifyUserGone === null, 'User no longer exists in MongoDB');

    console.log('\n====================================================');
    console.log(' [4] TESTING REPOSITORY CRUD OPERATIONS');
    console.log('====================================================');
    const testRepoFullName = `test-org/repo-crud-${Date.now()}`;
    const [testOwner, testRepoName] = testRepoFullName.split('/');

    // 4.1 CREATE REPOSITORY
    const createRepoRes = await fetch(`${baseUrl}/repositories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: testRepoFullName,
        gitUrl: `https://github.com/${testRepoFullName}`,
        defaultBranch: 'main',
        description: 'Temporary repository for CRUD automated test',
        language: 'TypeScript / Express',
        conventions: {
          routesDir: 'src/api/routes',
          controllersDir: 'src/api/controllers',
          servicesDir: 'src/api/services',
          modelsDir: 'src/api/models',
        },
      }),
    });
    const createRepoData = await createRepoRes.json();
    assert(createRepoRes.status === 201, 'Create repository returns 201');
    assert(createRepoData.repository?.fullName === testRepoFullName, 'Created repo has correct fullName');
    assert(createRepoData.repository?.conventions?.routesDir === 'src/api/routes', 'Custom conventions persisted');

    // Auto-provisioned baseline check
    const baselineGraph = await AstCallGraph.findOne({ repository: testRepoFullName });
    assert(baselineGraph !== null, 'Initial baseline AST graph auto-provisioned in MongoDB');
    const baselinePr = await PullRequestRun.findOne({ repository: testRepoFullName, prNumber: 1 });
    assert(baselinePr !== null, 'Initial baseline PR run auto-provisioned in MongoDB');
    const baselineMatrix = await TestMatrix.findOne({ repository: testRepoFullName, prNumber: 1 });
    assert(baselineMatrix !== null, 'Initial baseline Test Matrix auto-provisioned in MongoDB');

    // 4.2 READ REPOSITORIES (LIST)
    const listReposRes = await fetch(`${baseUrl}/repositories`);
    const listReposData = await listReposRes.json();
    assert(listReposRes.status === 200, 'List repositories returns 200');
    assert(
      Array.isArray(listReposData.repositories) &&
        listReposData.repositories.some((r) => r.fullName === testRepoFullName),
      'Created repository appears in list'
    );

    // 4.3 READ SINGLE REPOSITORY (GET BY OWNER / REPO)
    const getRepoRes = await fetch(`${baseUrl}/repositories/${testOwner}/${testRepoName}`);
    const getRepoData = await getRepoRes.json();
    assert(getRepoRes.status === 200, 'Get single repo returns 200');
    assert(getRepoData.repository?.fullName === testRepoFullName, 'Fetched repo matches fullName');

    // 4.4 UPDATE REPOSITORY CONFIG
    const updateRepoRes = await fetch(`${baseUrl}/repositories/${testOwner}/${testRepoName}/config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        defaultBranch: 'develop',
        conventions: {
          routesDir: 'backend/routes',
          controllersDir: 'backend/controllers',
          servicesDir: 'backend/services',
          modelsDir: 'backend/models',
        },
      }),
    });
    const updateRepoData = await updateRepoRes.json();
    assert(updateRepoRes.status === 200, 'Update repo config returns 200');
    assert(updateRepoData.repository?.defaultBranch === 'develop', 'Default branch updated in MongoDB');
    assert(updateRepoData.repository?.conventions?.routesDir === 'backend/routes', 'Conventions updated in MongoDB');

    // 4.5 SCAN REPOSITORY (ACTION)
    const scanRepoRes = await fetch(`${baseUrl}/repositories/${testOwner}/${testRepoName}/scan`, {
      method: 'POST',
    });
    const scanRepoData = await scanRepoRes.json();
    assert(scanRepoRes.status === 200, 'Scan repository returns 200');
    assert(scanRepoData.repository?.status === 'scanned', 'Repository status updated to scanned');

    // 4.6 SIMULATE PR WEBHOOK (ACTION / CREATE PR RUN)
    const simulatePrRes = await fetch(`${baseUrl}/repositories/simulate-pr`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: testRepoFullName,
        prNumber: 99,
        prTitle: 'feat: automated test PR simulation',
        branch: 'feat/test-suite',
        author: 'automated-tester',
      }),
    });
    const simulatePrData = await simulatePrRes.json();
    assert(simulatePrRes.status === 200, 'Simulate PR webhook returns 200');
    assert(simulatePrData.prRun?.prNumber === 99, 'PR run created in MongoDB with PR #99');

    // Verify PR run can be fetched via PullRequest routes
    const getLatestPrRes = await fetch(`${baseUrl}/pull-requests/latest?repository=${encodeURIComponent(testRepoFullName)}&prNumber=99`);
    const getLatestPrData = await getLatestPrRes.json();
    assert(getLatestPrRes.status === 200, 'Get latest PR run returns 200');
    assert(getLatestPrData.run?.prNumber === 99, 'PR run data retrieved correctly');

    // 4.7 DELETE REPOSITORY (CASCADE CLEANUP)
    const deleteRepoRes = await fetch(`${baseUrl}/repositories/${testOwner}/${testRepoName}`, {
      method: 'DELETE',
    });
    const deleteRepoData = await deleteRepoRes.json();
    assert(deleteRepoRes.status === 200, 'Delete repository returns 200');
    assert(deleteRepoData.success === true, 'Delete confirmed success');

    // Verify cascade cleanup in MongoDB
    const verifyRepoGone = await Repository.findOne({ fullName: testRepoFullName });
    assert(verifyRepoGone === null, 'Repository deleted from MongoDB');
    const verifyPrRunsGone = await PullRequestRun.find({ repository: testRepoFullName });
    assert(verifyPrRunsGone.length === 0, 'Associated PR runs cascade deleted');
    const verifyAstGone = await AstCallGraph.find({ repository: testRepoFullName });
    assert(verifyAstGone.length === 0, 'Associated AST call graphs cascade deleted');
    const verifyMatrixGone = await TestMatrix.find({ repository: testRepoFullName });
    assert(verifyMatrixGone.length === 0, 'Associated Test Matrices cascade deleted');

    console.log('\n====================================================');
    console.log(' [5] TESTING TEST SYNTHESIS MATRIX VALIDATION');
    console.log('====================================================');
    const testMatrixPayload = {
      $schema: 'https://test360.ai/schemas/test-matrix-v1.json',
      metadata: {
        engine: 'Test360-Coder-1.5B-QLoRA',
        slmCheckpoint: 'test360-coder:1.5b-qlora-4bit',
        validationEngine: 'zod@3.23.8',
        prNumber: 48,
        targetCommit: 'a4f91c2',
      },
      routes: [
        {
          endpoint: '/api/orders/checkout',
          method: 'POST',
          testCases: [
            {
              id: 'TC-01',
              partition: 'boundary_min',
              field: 'items[0].quantity',
              injectedValue: 0,
              expectedHttp: 400,
              zodVerified: true,
            },
          ],
        },
      ],
    };

    const validateRes = await fetch(`${baseUrl}/test-specs/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonString: JSON.stringify(testMatrixPayload) }),
    });
    const validateData = await validateRes.json();
    assert(validateRes.status === 200, 'Validate test matrix returns 200');
    assert(validateData.status === 'valid', 'Test matrix validation succeeds');

    console.log('\n====================================================');
    console.log(' [6] TESTING LIVE GITHUB WEBHOOK CONNECTION');
    console.log('====================================================');
    // Create a temporary repository with a known webhook secret
    const webhookRepoName = `test-wh/repo-${Date.now()}`;
    const testSecret = 'whsec_test_secret_key_12345';
    await Repository.create({
      fullName: webhookRepoName,
      owner: 'test-wh',
      repoName: webhookRepoName.split('/')[1],
      webhookSecret: testSecret,
      installationId: 'inst_9988',
    });

    // 6.1 Reject forged signature
    const forgedPayload = JSON.stringify({ repository: { full_name: webhookRepoName }, zen: 'test' });
    const forgedRes = await fetch(`${baseUrl}/ingestion/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hub-signature-256': 'sha256=0000000000000000000000000000000000000000000000000000000000000000',
        'x-github-event': 'ping',
      },
      body: forgedPayload,
    });
    assert(forgedRes.status === 401, 'Forged webhook signature rejected with 401');

    // 6.2 Accept valid GitHub ping event with real HMAC
    const validHmac = crypto.createHmac('sha256', testSecret).update(Buffer.from(forgedPayload)).digest('hex');
    const validPingRes = await fetch(`${baseUrl}/ingestion/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hub-signature-256': `sha256=${validHmac}`,
        'x-github-event': 'ping',
      },
      body: forgedPayload,
    });
    const validPingData = await validPingRes.json();
    assert(validPingRes.status === 200, 'Valid GitHub ping event returns 200 OK');
    assert(validPingData.status === 'pong', 'GitHub ping returns status pong');
    assert(validPingData.slaSatisfied === true, 'GitHub ping ACK latency satisfied <100ms SLA');

    // 6.3 Test Delivery API endpoint
    const testDeliveryRes = await fetch(`${baseUrl}/ingestion/test-delivery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repoFullName: webhookRepoName, event: 'ping' }),
    });
    const testDeliveryData = await testDeliveryRes.json();
    assert(testDeliveryRes.status === 200, 'Test delivery endpoint returns 200');
    assert(testDeliveryData.signatureVerified === true, 'Test delivery verified HMAC signature');
    assert(testDeliveryData.slaMet === true, 'Test delivery met <100ms SLA');

    // Clean up temporary webhook repo
    await Repository.deleteOne({ fullName: webhookRepoName });

    console.log('\n====================================================');
    console.log(' [7] TESTING LIVE DISK SCANNING FOR AST ENGINE');
    console.log('====================================================');
    // 7.1 Register repo pointing to sample-express-api fixture on disk
    const fixturePath = path.resolve(process.cwd(), 'test-fixtures', 'sample-express-api');
    const diskRepoName = `disk-test/sample-express-api-${Date.now()}`;
    const [diskOwner, diskBase] = diskRepoName.split('/');

    const createDiskRepoRes = await fetch(`${baseUrl}/repositories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: diskRepoName,
        gitUrl: `https://github.com/${diskRepoName}`,
        localPath: fixturePath,
        conventions: {
          routesDir: 'src/routes',
          controllersDir: 'src/controllers',
          servicesDir: 'src/services',
          modelsDir: 'src/models',
        },
      }),
    });
    assert(createDiskRepoRes.status === 201, 'Create disk repo returns 201');

    // 7.2 Trigger Live Disk Scan
    const scanDiskRes = await fetch(`${baseUrl}/repositories/${diskOwner}/${diskBase}/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ localPath: fixturePath }),
    });
    const scanDiskData = await scanDiskRes.json();
    assert(scanDiskRes.status === 200, 'Live disk scan returns 200');
    assert(scanDiskData.scannedOnDisk === true, 'Scan confirmed executed on disk');
    assert(scanDiskData.nodesCount === 6, 'Parsed 6 source files into AST nodes');
    assert(scanDiskData.edgesCount >= 4, 'Generated directed dependency call edges between layers');

    // 7.3 Verify extracted routes from real file
    const routesDiscovered = scanDiskData.detectedRoutes || [];
    assert(routesDiscovered.includes('POST /api/orders'), 'Extracted real POST /api/orders route');
    assert(routesDiscovered.includes('GET /api/orders/:id'), 'Extracted real GET /api/orders/:id route');
    assert(routesDiscovered.includes('PUT /api/orders/:id/status'), 'Extracted real PUT /api/orders/:id/status route');
    assert(routesDiscovered.includes('DELETE /api/orders/:id'), 'Extracted real DELETE /api/orders/:id route');

    // 7.4 Verify AstCallGraph stored in MongoDB
    const storedGraph = await AstCallGraph.findOne({ repository: diskRepoName });
    assert(storedGraph !== null, 'AstCallGraph saved in MongoDB for disk repo');
    assert(storedGraph.nodes.length === 6, 'MongoDB AST nodes count matches 6 files');

    // Check Mongoose schemas extracted in models nodes
    const orderModelNode = storedGraph.nodes.find((n) => n.id === 'models-Order');
    assert(orderModelNode !== null, 'Order model node extracted');
    const orderFields = (orderModelNode?.mongooseFields || []).map((f) => f.name);
    assert(orderFields.includes('orderNumber'), 'Extracted Mongoose field orderNumber');
    assert(orderFields.includes('customerEmail'), 'Extracted Mongoose field customerEmail');

    // Check process.env keys extracted
    const allEnvKeys = storedGraph.summary?.envKeysSynthesized || [];
    assert(
      allEnvKeys.includes('JWT_SECRET') || allEnvKeys.includes('ORDER_TIMEOUT_MS'),
      'Extracted process.env keys via AST visitor'
    );

    // Clean up disk repo
    await fetch(`${baseUrl}/repositories/${diskOwner}/${diskBase}`, { method: 'DELETE' });

    console.log('\n====================================================');
    console.log(` VERIFICATION SUMMARY: ${testPassed} PASSED, ${testFailed} FAILED`);
    console.log('====================================================\n');
  } finally {
    server.close();
    await disconnectDatabase();
  }

  if (testFailed > 0) {
    process.exit(1);
  }
}

runCrudVerification().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});

