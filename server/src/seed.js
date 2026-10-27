import mongoose from 'mongoose';
import { env } from './config/env.js';
import { Repository } from './modules/repositories/repository.model.js';
import { User } from './modules/auth/user.model.js';
import { PullRequestRun } from './modules/pull-requests/pr-run.model.js';
import { AstCallGraph } from './modules/ast-analysis/ast.model.js';
import { TestMatrix } from './modules/test-synthesis/test-spec.model.js';
import { SandboxRun } from './modules/docker-sandbox/sandbox.model.js';
import { MutationReport } from './modules/mutation-testing/mutation.model.js';

import {
  mockPrScorecard,
  mockAstNodes,
  mockTestCases,
  mockTemplates,
  mockRawJsonMatrix,
  mockSelfHealingIterations,
  mockTerminalLogs,
  mockMutants,
  mockAutocannonMetrics,
  mockHistoricalPrRuns,
} from '../../client/src/shared/data/mockPrRun.js';

const seedDatabase = async () => {
  console.log(`[Seed] Connecting to MongoDB at ${env.MONGO_URI}...`);
  await mongoose.connect(env.MONGO_URI);
  console.log('[Seed] Connected. Seeding collections with dynamic production telemetry...');

  // 0. Seed Users
  await User.deleteMany({});
  await User.insertMany([
    {
      name: 'Developer Lead',
      email: 'dev@test360.ai',
      role: 'developer',
      githubUsername: 'dev-alinasir',
      organization: 'Test360 Engineering',
      bio: 'Full-stack Express.js & MERN developer working on autonomous test synthesis.',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    },
    {
      name: 'QA Reviewer',
      email: 'qa@test360.ai',
      role: 'reviewer',
      githubUsername: 'khizar-se',
      organization: 'Test360 QA Team',
      bio: 'Quality assurance lead tracking mutation kill scores and API regression health.',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    },
    {
      name: 'Platform Administrator',
      email: 'admin@test360.ai',
      role: 'admin',
      githubUsername: 'sys-admin',
      organization: 'Test360 Platform',
      bio: 'Repository admin configuring webhook secrets, permissions, and engine conventions.',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    },
  ]);
  console.log('[Seed] Users seeded (3 role-based accounts).');

  // 1. Seed Repositories
  await Repository.deleteMany({});
  await Repository.insertMany([
    {
      fullName: 'szabist-se/ecommerce-express-api',
      owner: 'szabist-se',
      repoName: 'ecommerce-express-api',
      installationId: '5892104',
      defaultBranch: 'main',
      conventions: {
        routesDir: 'src/routes',
        controllersDir: 'src/controllers',
        servicesDir: 'src/services',
        modelsDir: 'src/models',
      },
    },
    {
      fullName: 'acme/inventory-service-ts',
      owner: 'acme',
      repoName: 'inventory-service-ts',
      installationId: '9841203',
      defaultBranch: 'main',
      conventions: {
        routesDir: 'routes',
        controllersDir: 'controllers',
        servicesDir: 'services',
        modelsDir: 'models',
      },
    },
  ]);
  console.log('[Seed] Repositories seeded (2 active repos).');

  // 2. Seed Pull Request Runs (PR #48 current run + historical runs)
  await PullRequestRun.deleteMany({});
  const runsToInsert = [
    {
      repository: mockPrScorecard.repository,
      prNumber: mockPrScorecard.prNumber,
      prTitle: mockPrScorecard.prTitle,
      branch: mockPrScorecard.branch,
      baseBranch: mockPrScorecard.baseBranch,
      commitSha: mockPrScorecard.commitSha,
      author: mockPrScorecard.author,
      status: 'failed',
      totalDurationMs: 52400,
      webhookLatencyMs: mockPrScorecard.webhookLatencyMs,
      tiers: mockPrScorecard.tiers,
      blastRadius: mockPrScorecard.blastRadius,
      mutationScore: mockPrScorecard.mutationKillScore,
      latency: mockPrScorecard.latency,
      isolatedDefect: {
        file: 'src/controllers/checkoutController.ts',
        line: 64,
        errorType: 'Unhandled Negative Value Validation / Mongoose Schema Crash',
        description:
          'The controller attempts to subtract item.quantity from stock without checking if quantity > 0.',
      },
    },
  ];

  mockHistoricalPrRuns.forEach((h) => {
    if (h.prNumber !== 48) {
      runsToInsert.push({
        repository: 'szabist-se/ecommerce-express-api',
        prNumber: h.prNumber,
        prTitle: h.title,
        branch: `branch-pr-${h.prNumber}`,
        baseBranch: 'main',
        commitSha: h.commitSha,
        author: h.author,
        status: h.status,
        totalDurationMs: h.totalDurationSec * 1000,
        webhookLatencyMs: Math.round(35 + Math.random() * 15),
        tiers: {
          unit: { passed: 18, total: 18, status: 'passed', duration: '3.9s' },
          api: { passed: h.status === 'passed' ? 12 : 9, total: 12, status: h.status, duration: '14.2s' },
          uiSmoke: { passed: 4, total: 4, status: 'passed', duration: '10.1s' },
          load: { status: 'passed', duration: '18.0s', p90: h.latencyP90, p95: h.latencyP95, p99: h.latencyP99, connections: 100 },
        },
        mutationScore: { score: h.mutationKillScore, killed: 17, survived: 3, sampled: 20 },
        latency: { p90: h.latencyP90, p95: h.latencyP95, p99: h.latencyP99 },
      });
    }
  });

  await PullRequestRun.insertMany(runsToInsert);
  console.log(`[Seed] Pull Request Runs seeded (${runsToInsert.length} runs).`);

  // 3. Seed AST Call Graph (Nodes & Edges)
  await AstCallGraph.deleteMany({});
  await AstCallGraph.create({
    repository: 'szabist-se/ecommerce-express-api',
    commitSha: 'a4f91c28f93e921d',
    nodes: mockAstNodes,
    edges: [
      { id: 'e-routes-controllers', source: 'routes-orderRoutes', target: 'controllers-checkoutController' },
      { id: 'e-routes-middlewares', source: 'routes-orderRoutes', target: 'middlewares-validateOrder' },
      { id: 'e-controllers-services', source: 'controllers-checkoutController', target: 'services-inventoryService' },
      { id: 'e-controllers-models-order', source: 'controllers-checkoutController', target: 'models-Order' },
      { id: 'e-controllers-models-product', source: 'controllers-checkoutController', target: 'models-Product' },
      { id: 'e-services-models-product', source: 'services-inventoryService', target: 'models-Product' },
    ],
    layers: ['routes', 'middlewares', 'controllers', 'services', 'models'],
    summary: {
      totalFilesTraversed: mockAstNodes.length,
      routesImpacted: 4,
      modifiedFiles: mockPrScorecard.blastRadius.modifiedFiles,
      blastRadiusFiles: mockPrScorecard.blastRadius.affectedFiles,
    },
  });
  console.log(`[Seed] AST Call Graph seeded with ${mockAstNodes.length} nodes & blast radius.`);

  // 4. Seed TestMatrix
  await TestMatrix.deleteMany({});
  await TestMatrix.create({
    repository: 'szabist-se/ecommerce-express-api',
    prNumber: 48,
    testCases: mockTestCases,
    rawJsonMatrix: mockRawJsonMatrix,
    compiledTemplates: mockTemplates,
  });
  console.log(`[Seed] Test Matrix seeded with ${mockTestCases.length} synthesized test cases.`);

  // 5. Seed SandboxRun
  await SandboxRun.deleteMany({});
  await SandboxRun.create({
    repository: 'szabist-se/ecommerce-express-api',
    prNumber: 48,
    containerId: 'test360-sandbox-pr48-run',
    exitCode: 1,
    dockerFlags: [
      '--user=node',
      '--cap-drop=ALL',
      '--memory=1.5g',
      '--cpus=1.0',
      '--disable-dev-shm-usage',
      '--read-only',
      '--network=none',
    ],
    securityProfile: {
      user: 'USER node (1000:1000)',
      capabilities: ['--cap-drop=ALL'],
      memoryLimit: '1.5g',
      cpuLimit: '1.0',
      readOnlyRoot: true,
      networkMode: 'loopback',
    },
    selfHealingIterations: mockSelfHealingIterations,
    logs: mockTerminalLogs,
  });
  console.log(`[Seed] Sandbox Run seeded with ${mockTerminalLogs.length} logs & self-healing steps.`);

  // 6. Seed Mutation Report
  await MutationReport.deleteMany({});
  await MutationReport.create({
    repository: 'szabist-se/ecommerce-express-api',
    prNumber: 48,
    mutantsSampled: mockMutants.length,
    mutantsKilled: mockMutants.filter((m) => m.verdict === 'KILLED').length,
    mutantsSurvived: mockMutants.filter((m) => m.verdict === 'SURVIVED').length,
    killScorePercentage: 85.0,
    mutants: mockMutants,
    autocannonMetrics: mockAutocannonMetrics,
  });
  console.log(`[Seed] Mutation Report seeded with ${mockMutants.length} mutants and Autocannon metrics.`);

  console.log('[Seed] Complete! MongoDB test360_ai is now populated with live data.');
  await mongoose.disconnect();
};

seedDatabase().catch((err) => {
  console.error('[Seed Error]:', err);
  process.exit(1);
});
