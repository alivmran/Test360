import http from 'http';
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
    assert(registerData.user?.email === testEmail, 'Created user has correct email');
    createdUserId = registerData.user?._id;
    console.log(`  Created User ID: ${createdUserId}`);

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

