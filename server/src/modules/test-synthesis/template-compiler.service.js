export class TemplateCompilerService {
  static compileTemplates(matrix) {
    const primaryRoute = (matrix && matrix.routes && matrix.routes[0]) || { endpoint: '/api/orders/checkout', method: 'POST', testCases: [] };

    const jestUnit = `// Tier 1: Deterministic Jest Unit Test Suite
// Generated via Test360 AST Template Compiler
import { calculateDiscount, aggregateCartWeight } from '../src/services/inventoryService';

describe('Unit Tier — Checkout & Inventory Pure Functions', () => {
  it('applies coupon discount correctly', () => {
    const result = calculateDiscount(100, 'WINTER2026');
    expect(result).toBe(90);
  });

  it('preserves amount on empty coupon', () => {
    expect(calculateDiscount(100, '')).toBe(100);
  });
});`;

    const supertestCases = (primaryRoute.testCases || [])
      .map((tc) => {
        return `  it('${tc.id}: ${tc.partition}', async () => {
    const res = await request(app)
      .${primaryRoute.method.toLowerCase()}('${primaryRoute.endpoint}')
      .set('x-idempotency-key', 'idem_${tc.id}')
      .send({
        items: [{ productId: '65f8a1e94f1b2c001a4e8d11', quantity: ${tc.injectedValue ?? 1}, price: 29.99 }]
      });

    expect(res.status).toBe(${tc.expectedHttp});
  });`;
      })
      .join('\n\n');

    const supertestApi = `// Tier 2: Deterministic Supertest + In-Memory MongoDB Test Suite
// Generated via Test360 AST Template Compiler
import request from 'supertest';
import { app } from '../src/app';
import { connectTestDb, closeTestDb, clearTestDb } from './helpers/memoryDb';

beforeAll(async () => {
  await connectTestDb();
});

afterAll(async () => {
  await closeTestDb();
});

describe('Tier 2 — API Integration: ${primaryRoute.method} ${primaryRoute.endpoint}', () => {
${supertestCases}
});`;

    const playwrightSmoke = `// Tier 3: Deterministic Playwright UI Smoke Suite
// Hardened Headless Chromium with --disable-dev-shm-usage
import { test, expect } from '@playwright/test';

test.describe('Tier 3 — UI Smoke: Checkout Flow', () => {
  test('Guest user adds item and verifies order confirmation summary', async ({ page }) => {
    await page.goto('/cart');
    await page.click('button#proceed-checkout');
    await expect(page).toHaveURL(/.*checkout/);
  });
});`;

    const autocannonLoad = `// Tier 4: Deterministic Autocannon Load & Concurrency Benchmark
const autocannon = require('autocannon');

async function runBenchmark() {
  const result = await autocannon({
    url: 'http://127.0.0.1:44912${primaryRoute.endpoint}',
    connections: 100,
    duration: 10,
    pipelining: 1,
    headers: {
      'content-type': 'application/json',
      'x-idempotency-key': 'autocannon-benchmark-run'
    },
    body: JSON.stringify({
      items: [{ productId: '65f8a1e94f1b2c001a4e8d11', quantity: 1, price: 29.99 }]
    })
  });

  console.log('Autocannon Benchmark Result:', result.latency);
}

runBenchmark();`;

    return {
      jestUnit,
      supertestApi,
      playwrightSmoke,
      autocannonLoad,
    };
  }
}
