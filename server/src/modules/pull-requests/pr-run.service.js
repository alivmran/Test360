import { PullRequestRun } from './pr-run.model.js';
import { enqueuePullRequestRun } from './pr-run.queue.js';

export class PullRequestService {
  static async getLatestRun(repository, prNumber) {
    const query = { repository };
    if (prNumber) query.prNumber = Number(prNumber);

    const run = await PullRequestRun.findOne(query).sort({ prNumber: -1 });
    if (run) return run;

    // Default seeded fallback
    return {
      repository: repository || 'szabist-se/ecommerce-express-api',
      prNumber: Number(prNumber) || 48,
      prTitle: 'feat(checkout): add stock reservation & discount validation',
      branch: 'feat/checkout-stock-v2',
      baseBranch: 'main',
      commitSha: 'a4f91c28f93e921d0a5b82141512b918ac5d901f',
      author: 'dev-alinasir',
      status: 'failed',
      totalPipelineDuration: '52.4s',
      webhookLatencyMs: 41,
      tiers: {
        unit: { passed: 16, total: 16, status: 'passed', duration: '4.2s', details: 'Pure functions, coupon discount calculator, cart weight aggregator, middleware token formatters.' },
        api: { passed: 9, total: 10, status: 'failed', duration: '18.7s', details: 'Integration routes mounted with Supertest + In-Memory MongoDB (v7.0).', failureMessage: 'POST /api/orders/checkout returned 500 Internal Server Error instead of 400 Bad Request on negative item quantity.' },
        uiSmoke: { passed: 4, total: 4, status: 'passed', duration: '11.5s', details: 'Headless Chromium with --disable-dev-shm-usage (Cart to Checkout stepper).' },
        load: { passed: 1, total: 1, status: 'passed', duration: '18.0s', details: 'Autocannon 100 concurrent workers for 10s. Zero event loop freezes.', connections: 100 }
      },
      blastRadius: {
        routesImpacted: 4,
        filesTraversed: 14,
        modifiedFiles: ['src/controllers/checkoutController.ts', 'src/middlewares/validateOrder.ts'],
        affectedFiles: ['src/routes/orderRoutes.ts', 'src/services/inventoryService.ts', 'src/models/Order.ts', 'src/models/Product.ts'],
        skippedFiles: ['src/routes/userRoutes.ts', 'src/controllers/profileController.ts', 'src/models/User.ts', 'src/services/authService.ts']
      },
      mutationScore: { score: 85.0, killed: 17, survived: 3, sampled: 20 },
      latency: { p90: 38, p95: 61, p99: 112 }
    };
  }

  static async listHistoricalRuns(repository) {
    const runs = await PullRequestRun.find({ repository }).sort({ prNumber: 1 }).limit(10);
    if (runs.length > 0) return runs;

    return [
      { prNumber: 41, title: 'refactor(auth): migrate to argon2 password hashing', commitSha: 'f8101a1', mutationKillScore: 78.5, latencyP90: 42, latencyP95: 68, latencyP99: 125, status: 'passed' },
      { prNumber: 42, title: 'feat(cart): implement multi-currency pricing calculation', commitSha: 'b9412c9', mutationKillScore: 81.0, latencyP90: 39, latencyP95: 65, latencyP99: 119, status: 'passed' },
      { prNumber: 43, title: 'fix(mongo): add missing compound index on orderNumber and userId', commitSha: 'c3182d3', mutationKillScore: 83.2, latencyP90: 31, latencyP95: 52, latencyP99: 98, status: 'passed' },
      { prNumber: 44, title: 'feat(webhook): add Stripe charge.succeeded idempotent dispatcher', commitSha: 'd4918e7', mutationKillScore: 86.4, latencyP90: 45, latencyP95: 74, latencyP99: 140, status: 'passed' },
      { prNumber: 45, title: 'perf(redis): pipeline inventory decrement locks', commitSha: 'e5021a8', mutationKillScore: 82.0, latencyP90: 28, latencyP95: 47, latencyP99: 89, status: 'passed' },
      { prNumber: 46, title: 'fix(tax): compute regional VAT for EU shipping destinations', commitSha: '99201fa', mutationKillScore: 84.1, latencyP90: 35, latencyP95: 59, latencyP99: 108, status: 'passed' },
      { prNumber: 47, title: 'feat(search): text indexing for product catalog endpoints', commitSha: '11928bc', mutationKillScore: 80.5, latencyP90: 52, latencyP95: 88, latencyP99: 165, status: 'passed' },
      { prNumber: 48, title: 'feat(checkout): add stock reservation & discount validation', commitSha: 'a4f91c2', mutationKillScore: 85.0, latencyP90: 38, latencyP95: 61, latencyP99: 112, status: 'failed' }
    ];
  }

  static async triggerRerun(data) {
    return await enqueuePullRequestRun(data);
  }
}
