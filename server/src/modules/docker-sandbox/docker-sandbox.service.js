import { env } from '../../config/env.js';
import { SandboxRun } from './sandbox.model.js';

export class DockerSandboxService {
  static getHardenedSecurityProfile() {
    return {
      user: `USER ${env.DOCKER_USER} (1000:1000)`,
      capabilities: ['--cap-drop=ALL'],
      memoryLimit: env.DOCKER_MEMORY_LIMIT,
      cpuLimit: env.DOCKER_CPU_LIMIT,
      readOnlyRoot: true,
      networkMode: 'loopback',
    };
  }

  static getDockerLaunchFlags() {
    return [
      `--user=${env.DOCKER_USER}`,
      '--cap-drop=ALL',
      `--memory=${env.DOCKER_MEMORY_LIMIT}`,
      `--cpus=${env.DOCKER_CPU_LIMIT}`,
      '--disable-dev-shm-usage',
      '--read-only',
      '--network=none',
    ];
  }

  static getInjectedEnvTest(mongoPort = 44912) {
    return {
      PORT: '0',
      NODE_ENV: 'test',
      MONGO_URI: `mongodb://127.0.0.1:${mongoPort}/test360`,
      JWT_SECRET: 'test360_ephemeral_mock_jwt_secret',
      CHECKOUT_RATE_LIMIT_MAX: '1000',
    };
  }

  static async getSandboxRun(repository = 'szabist-se/ecommerce-express-api', prNumber = 48) {
    const existing = await SandboxRun.findOne({ repository, prNumber });
    if (existing) return existing;

    return {
      repository,
      prNumber,
      containerId: 'test360-sandbox-pr48-run',
      securityProfile: this.getHardenedSecurityProfile(),
      dockerLaunchFlags: this.getDockerLaunchFlags(),
      injectedEnv: this.getInjectedEnvTest(),
      selfHealingSteps: [
        {
          iteration: 0,
          title: 'Initial Execution in Docker Container',
          status: 'failed',
          summary: 'Container test runner terminated with exit code 1.',
          errorTrace: "AssertionError: Missing required header 'x-idempotency-key' in request headers",
          healingActionTaken: 'Self-Healing Engine parsed stderr trace and identified missing header schema.'
        },
        {
          iteration: 1,
          title: 'Self-Healing Iteration 1 / 2 (Test Parameter Repair)',
          status: 'repaired',
          summary: 'Injected required idempotency key into synthesized JSON matrix & re-compiled Supertest template.',
          healingActionTaken: 'Updated test generator contract with header injection: x-idempotency-key: idem_auto_healed',
          errorTrace: 'AssertionError: expected 400 to equal 500 at checkoutController.ts:64:13'
        },
        {
          iteration: 2,
          title: 'Self-Healing Iteration 2 / 2 (Defect Isolation)',
          status: 'passed',
          summary: 'Test suite setup 100% stable; successfully isolated genuine application bug in PR code.',
          healingActionTaken: 'Verified test environment is valid. Flagged application-level bug for Monaco 1-Click Repair.',
          isolatedDefect: {
            file: 'src/controllers/checkoutController.ts',
            line: 64,
            errorType: 'Unhandled Negative Value Validation / Mongoose Schema Crash',
            description: 'The controller attempts to subtract item.quantity from stock without checking if quantity > 0. When quantity is negative, it corrupts inventory count and triggers unhandled 500 error.'
          }
        }
      ],
      logs: this.getDefaultLogs()
    };
  }

  static getDefaultLogs() {
    return [
      { id: '1', timestamp: '21:32:10.104', stream: 'SYSTEM', message: '[DOCKER] Spawning ephemeral container test360-sandbox-pr48-run' },
      { id: '2', timestamp: '21:32:10.220', stream: 'SYSTEM', message: '[SECURITY] Applying flags: --memory=1.5g --cpus=1.0 --cap-drop=ALL --read-only' },
      { id: '3', timestamp: '21:32:10.350', stream: 'SYSTEM', message: '[SECURITY] Switching UID to node (1000:1000) - Unprivileged sandbox active' },
      { id: '4', timestamp: '21:32:10.480', stream: 'SYSTEM', message: '[NETWORK] Egress firewall established: Loopback 127.0.0.1 allowed, external blocked' },
      { id: '5', timestamp: '21:32:10.820', stream: 'STDOUT', message: '[MONGODB] Starting mongodb-memory-server v7.0.0 on port 44912' },
      { id: '6', timestamp: '21:32:11.450', stream: 'STDOUT', message: '[MONGODB] Connection string established: mongodb://127.0.0.1:44912/test360' },
      { id: '7', timestamp: '21:32:11.600', stream: 'STDOUT', message: '[ENV] Injected synthesized .env.test with PORT=0, MONGO_URI=mongodb://127.0.0.1:44912/test360' },
      { id: '8', timestamp: '21:32:12.110', stream: 'STDOUT', message: '[SEED] Ingested 10 seeded Mongoose documents for Product and User' },
      { id: '9', timestamp: '21:32:12.400', stream: 'STDOUT', message: '[RUNNER] Starting Tier 1: Jest Unit Tests (16 specs)...' },
      { id: '10', timestamp: '21:32:16.600', stream: 'STDOUT', message: '  PASS  test/jest.unit.test.ts (16/16 passed, 4.2s)' },
      { id: '11', timestamp: '21:32:16.800', stream: 'STDOUT', message: '[RUNNER] Starting Tier 2: Supertest API Integration Tests (10 specs)...' },
      { id: '12', timestamp: '21:32:20.100', stream: 'STDERR', message: '  FAIL  test/supertest.api.test.ts' },
      { id: '13', timestamp: '21:32:20.105', stream: 'STDERR', message: '    ● Tier 2 — API Integration › TC-02: rejects order when item quantity is negative' },
      { id: '14', timestamp: '21:32:20.110', stream: 'STDERR', message: '      Expected: 400' },
      { id: '15', timestamp: '21:32:20.112', stream: 'STDERR', message: '      Received: 500' },
      { id: '16', timestamp: '21:32:20.115', stream: 'STDERR', message: '      at src/controllers/checkoutController.ts:64:13' },
      { id: '17', timestamp: '21:32:20.120', stream: 'STDERR', message: '      Unhandled Mongoose CastError / negative integer bounds corruption' },
      { id: '18', timestamp: '21:32:21.000', stream: 'SYSTEM', message: '[HEALING] Intercepted failure. Triggering closed-loop self-healing engine (Iteration 1/2)...' },
      { id: '19', timestamp: '21:32:22.350', stream: 'SYSTEM', message: '[HEALING] Verified idempotency key propagation. Re-running Supertest suite in clean memory isolate...' },
      { id: '20', timestamp: '21:32:25.800', stream: 'STDERR', message: '[HEALING] Iteration 2 complete. Defect isolated to application source code (checkoutController.ts:64).' },
      { id: '21', timestamp: '21:32:26.100', stream: 'STDOUT', message: '[RUNNER] Starting Tier 3: Playwright UI Smoke Tests (4 specs)...' },
      { id: '22', timestamp: '21:32:37.600', stream: 'STDOUT', message: '  PASS  test/playwright.smoke.spec.ts (4/4 passed, 11.5s)' },
      { id: '23', timestamp: '21:32:38.000', stream: 'STDOUT', message: '[RUNNER] Starting Tier 4: Autocannon Load & Concurrency Benchmark (100 workers, 10s)...' },
      { id: '24', timestamp: '21:32:48.200', stream: 'STDOUT', message: '  Autocannon completed: 18,420 requests in 10.05s | p90: 38ms | p95: 61ms | p99: 112ms' },
      { id: '25', timestamp: '21:32:50.000', stream: 'SYSTEM', message: '[AUDIT] Container run finished. Demounting volumes and wiping in-memory MongoDB.' }
    ];
  }
}
