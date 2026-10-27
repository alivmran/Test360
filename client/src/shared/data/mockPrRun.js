

export const mockPrScorecard = {
  repository: 'szabist-se/ecommerce-express-api',
  prNumber: 48,
  prTitle: 'feat(checkout): add stock reservation & discount validation',
  branch: 'feat/checkout-stock-v2',
  baseBranch: 'main',
  commitSha: 'a4f91c28f93e921d0a5b82141512b918ac5d901f',
  author: 'dev-alinasir',
  timestamp: '2026-10-20T21:32:10Z',
  totalPipelineDuration: '52.4s',
  webhookLatencyMs: 41,
  tiers: {
    unit: {
      passed: 16,
      total: 16,
      status: 'passed',
      duration: '4.2s',
      details: 'Pure functions, coupon discount calculator, cart weight aggregator, middleware token formatters.'
    },
    api: {
      passed: 9,
      total: 10,
      status: 'failed',
      duration: '18.7s',
      details: 'Integration routes mounted with Supertest + In-Memory MongoDB (v7.0).',
      failureMessage: 'POST /api/orders/checkout returned 500 Internal Server Error instead of 400 Bad Request on negative item quantity.'
    },
    uiSmoke: {
      passed: 4,
      total: 4,
      status: 'passed',
      duration: '11.5s',
      details: 'Headless Chromium with --disable-dev-shm-usage (Cart to Checkout stepper).'
    },
    load: {
      passed: 1,
      total: 1,
      status: 'passed',
      duration: '18.0s',
      details: 'Autocannon 100 concurrent workers for 10s. Zero event loop freezes.',
      connections: 100
    }
  },
  blastRadius: {
    routesImpacted: 4,
    filesTraversed: 14,
    modifiedFiles: [
      'src/controllers/checkoutController.ts',
      'src/middlewares/validateOrder.ts'
    ],
    affectedFiles: [
      'src/routes/orderRoutes.ts',
      'src/services/inventoryService.ts',
      'src/models/Order.ts',
      'src/models/Product.ts'
    ],
    skippedFiles: [
      'src/routes/userRoutes.ts',
      'src/controllers/profileController.ts',
      'src/models/User.ts',
      'src/services/authService.ts',
      'src/routes/analyticsRoutes.ts',
      'src/controllers/analyticsController.ts',
      'src/services/emailService.ts',
      'src/models/AuditLog.ts'
    ]
  },
  mutationKillScore: {
    score: 85.0,
    killed: 17,
    survived: 3,
    sampled: 20
  },
  latency: {
    p90: 38,
    p95: 61,
    p99: 112
  }
};

export const mockAstNodes = [
  {
    id: 'routes-orderRoutes',
    label: 'orderRoutes.ts',
    filePath: 'src/routes/orderRoutes.ts',
    layer: 'routes',
    category: 'IN_BLAST_RADIUS',
    lineCount: 78,
    exports: ['default', 'orderRouter'],
    imports: [
      { source: 'express', specifiers: ['Router'] },
      { source: '../controllers/checkoutController', specifiers: ['processCheckout', 'getOrderStatus'] },
      { source: '../middlewares/validateOrder', specifiers: ['validateOrderPayload', 'requireIdempotencyKey'] }
    ],
    httpEndpoints: [
      { verb: 'POST', path: '/api/orders/checkout', extractionMethod: 'Babel AST Visitor', handlerName: 'processCheckout' },
      { verb: 'GET', path: '/api/orders/:id/status', extractionMethod: 'Babel AST Visitor', handlerName: 'getOrderStatus' },
      { verb: 'POST', path: '/api/orders/reserve-stock', extractionMethod: 'Babel AST Visitor', handlerName: 'reserveStock' },
      { verb: 'DELETE', path: '/api/orders/:id/cancel', extractionMethod: 'Regex-Assisted Fallback', handlerName: 'cancelOrder' }
    ],
    processEnvKeys: ['CHECKOUT_RATE_LIMIT_MAX', 'IDEMPOTENCY_TTL_SECONDS']
  },
  {
    id: 'middlewares-validateOrder',
    label: 'validateOrder.ts',
    filePath: 'src/middlewares/validateOrder.ts',
    layer: 'middlewares',
    category: 'MODIFIED_IN_PR',
    lineCount: 94,
    exports: ['validateOrderPayload', 'requireIdempotencyKey'],
    imports: [
      { source: 'express', specifiers: ['Request', 'Response', 'NextFunction'] },
      { source: 'zod', specifiers: ['z'] }
    ],
    processEnvKeys: ['STRICT_VALIDATION_MODE']
  },
  {
    id: 'controllers-checkoutController',
    label: 'checkoutController.ts',
    filePath: 'src/controllers/checkoutController.ts',
    layer: 'controllers',
    category: 'MODIFIED_IN_PR',
    lineCount: 182,
    exports: ['processCheckout', 'getOrderStatus', 'reserveStock'],
    imports: [
      { source: '../services/inventoryService', specifiers: ['reserveInventory', 'releaseInventory'] },
      { source: '../models/Order', specifiers: ['Order'] },
      { source: '../models/Product', specifiers: ['Product'] }
    ],
    httpEndpoints: [
      { verb: 'POST', path: '/api/orders/checkout', extractionMethod: 'Babel AST Visitor', handlerName: 'processCheckout' },
      { verb: 'POST', path: '/api/orders/reserve-stock', extractionMethod: 'Babel AST Visitor', handlerName: 'reserveStock' }
    ],
    processEnvKeys: ['PAYMENT_GATEWAY_TIMEOUT_MS', 'ALLOW_NEGATIVE_STOCK']
  },
  {
    id: 'services-inventoryService',
    label: 'inventoryService.ts',
    filePath: 'src/services/inventoryService.ts',
    layer: 'services',
    category: 'IN_BLAST_RADIUS',
    lineCount: 145,
    exports: ['reserveInventory', 'releaseInventory', 'checkAvailability'],
    imports: [
      { source: '../models/Product', specifiers: ['Product'] }
    ],
    processEnvKeys: ['INVENTORY_LOCK_EXPIRY_SEC']
  },
  {
    id: 'models-Order',
    label: 'Order.ts',
    filePath: 'src/models/Order.ts',
    layer: 'models',
    category: 'IN_BLAST_RADIUS',
    lineCount: 88,
    exports: ['Order'],
    imports: [
      { source: 'mongoose', specifiers: ['Schema', 'model', 'Document'] }
    ],
    mongooseSchema: {
      modelName: 'Order',
      collection: 'orders',
      fields: [
        { name: 'orderNumber', type: 'String', required: true },
        { name: 'userId', type: 'ObjectId', ref: 'User', required: true },
        { name: 'items', type: 'Array', required: true },
        { name: 'totalAmount', type: 'Number', required: true },
        { name: 'status', type: 'String', default: 'pending' },
        { name: 'discountCode', type: 'String', required: false },
        { name: 'idempotencyKey', type: 'String', required: true }
      ]
    }
  },
  {
    id: 'models-Product',
    label: 'Product.ts',
    filePath: 'src/models/Product.ts',
    layer: 'models',
    category: 'IN_BLAST_RADIUS',
    lineCount: 72,
    exports: ['Product'],
    imports: [
      { source: 'mongoose', specifiers: ['Schema', 'model'] }
    ],
    mongooseSchema: {
      modelName: 'Product',
      collection: 'products',
      fields: [
        { name: 'sku', type: 'String', required: true },
        { name: 'name', type: 'String', required: true },
        { name: 'price', type: 'Number', required: true },
        { name: 'stockCount', type: 'Number', required: true, default: 0 },
        { name: 'category', type: 'String', required: true }
      ]
    }
  },
  {
    id: 'routes-userRoutes',
    label: 'userRoutes.ts',
    filePath: 'src/routes/userRoutes.ts',
    layer: 'routes',
    category: 'SKIPPED',
    lineCount: 65,
    exports: ['default'],
    imports: [
      { source: 'express', specifiers: ['Router'] },
      { source: '../controllers/profileController', specifiers: ['getProfile'] }
    ],
    httpEndpoints: [
      { verb: 'GET', path: '/api/users/profile', extractionMethod: 'Babel AST Visitor', handlerName: 'getProfile' }
    ]
  },
  {
    id: 'controllers-profileController',
    label: 'profileController.ts',
    filePath: 'src/controllers/profileController.ts',
    layer: 'controllers',
    category: 'SKIPPED',
    lineCount: 80,
    exports: ['getProfile'],
    imports: [
      { source: '../models/User', specifiers: ['User'] }
    ]
  },
  {
    id: 'models-User',
    label: 'User.ts',
    filePath: 'src/models/User.ts',
    layer: 'models',
    category: 'SKIPPED',
    lineCount: 60,
    exports: ['User'],
    imports: [
      { source: 'mongoose', specifiers: ['Schema', 'model'] }
    ],
    mongooseSchema: {
      modelName: 'User',
      collection: 'users',
      fields: [
        { name: 'email', type: 'String', required: true },
        { name: 'passwordHash', type: 'String', required: true },
        { name: 'tier', type: 'String', default: 'standard' }
      ]
    }
  },
  {
    id: 'services-authService',
    label: 'authService.ts',
    filePath: 'src/services/authService.ts',
    layer: 'services',
    category: 'SKIPPED',
    lineCount: 110,
    exports: ['verifyToken', 'signToken'],
    imports: [
      { source: 'jsonwebtoken', specifiers: ['sign', 'verify'] }
    ],
    processEnvKeys: ['JWT_SECRET', 'JWT_EXPIRES_IN']
  }
];

export const mockTestCases = [
  {
    id: 'TC-01',
    generator: 'BVA/EP Fuzzer',
    targetRoute: 'POST /api/orders/checkout',
    httpVerb: 'POST',
    partitionRule: 'Boundary min: item.quantity = 0 (Lower non-positive boundary)',
    payload: {
      items: [{ productId: '65f8a1e94f1b2c001a4e8d11', quantity: 0, price: 29.99 }],
      paymentMethod: 'credit_card',
      shippingAddress: { street: '123 Tech Ave', city: 'Karachi', country: 'PK' }
    },
    headers: { 'x-idempotency-key': 'idem_bva_001' },
    expectedStatus: 400,
    zodValidation: 'VALIDATED',
    executionTier: 'API',
    rationale: 'Zero quantity must be rejected before entering database transaction or inventory reservation.'
  },
  {
    id: 'TC-02',
    generator: 'BVA/EP Fuzzer',
    targetRoute: 'POST /api/orders/checkout',
    httpVerb: 'POST',
    partitionRule: 'Boundary min-1: item.quantity = -1 (Negative integer fuzzing)',
    payload: {
      items: [{ productId: '65f8a1e94f1b2c001a4e8d11', quantity: -1, price: 29.99 }],
      paymentMethod: 'credit_card',
      shippingAddress: { street: '123 Tech Ave', city: 'Karachi', country: 'PK' }
    },
    headers: { 'x-idempotency-key': 'idem_bva_002' },
    expectedStatus: 400,
    zodValidation: 'VALIDATED',
    executionTier: 'API',
    rationale: 'Negative quantity causes inventory inflation if unhandled; triggers Mongoose schema failure.'
  },
  {
    id: 'TC-03',
    generator: 'Test360-Coder 1.5B (QLoRA)',
    targetRoute: 'POST /api/orders/checkout',
    httpVerb: 'POST',
    partitionRule: 'Equivalence valid: Standard checkout with valid inventory and coupon',
    payload: {
      items: [{ productId: '65f8a1e94f1b2c001a4e8d11', quantity: 2, price: 29.99 }],
      discountCode: 'WINTER2026',
      paymentMethod: 'credit_card',
      shippingAddress: { street: '123 Tech Ave', city: 'Karachi', country: 'PK' }
    },
    headers: { 'x-idempotency-key': 'idem_coder_003' },
    expectedStatus: 201,
    zodValidation: 'VALIDATED',
    executionTier: 'API',
    rationale: 'Happy path verifying stock reservation deduction, coupon discount 10%, and Order record creation.'
  },
  {
    id: 'TC-04',
    generator: 'Test360-Coder 1.5B (QLoRA)',
    targetRoute: 'POST /api/orders/checkout',
    httpVerb: 'POST',
    partitionRule: 'Security: Missing required x-idempotency-key header',
    payload: {
      items: [{ productId: '65f8a1e94f1b2c001a4e8d11', quantity: 1, price: 29.99 }],
      paymentMethod: 'credit_card'
    },
    headers: {},
    expectedStatus: 400,
    zodValidation: 'VALIDATED',
    executionTier: 'API',
    rationale: 'Verifies requireIdempotencyKey middleware rejects requests before executing controller.'
  },
  {
    id: 'TC-05',
    generator: 'BVA/EP Fuzzer',
    targetRoute: 'POST /api/orders/checkout',
    httpVerb: 'POST',
    partitionRule: 'Equivalence invalid: Empty string discountCode = ""',
    payload: {
      items: [{ productId: '65f8a1e94f1b2c001a4e8d11', quantity: 1, price: 29.99 }],
      discountCode: '',
      paymentMethod: 'credit_card'
    },
    headers: { 'x-idempotency-key': 'idem_bva_005' },
    expectedStatus: 201,
    zodValidation: 'VALIDATED',
    executionTier: 'API',
    rationale: 'Empty discountCode should be treated as no coupon applied rather than throwing invalid coupon error.'
  },
  {
    id: 'TC-06',
    generator: 'BVA/EP Fuzzer',
    targetRoute: 'POST /api/orders/reserve-stock',
    httpVerb: 'POST',
    partitionRule: 'Boundary max: quantity = stockCount (Exact inventory depletion)',
    payload: {
      productId: '65f8a1e94f1b2c001a4e8d11',
      requestedQuantity: 50
    },
    expectedStatus: 200,
    zodValidation: 'VALIDATED',
    executionTier: 'Unit',
    rationale: 'Reserves the exact available stock and sets product status to out_of_stock.'
  },
  {
    id: 'TC-07',
    generator: 'Test360-Coder 1.5B (QLoRA)',
    targetRoute: 'POST /api/orders/reserve-stock',
    httpVerb: 'POST',
    partitionRule: 'Boundary max+1: requestedQuantity > available stockCount',
    payload: {
      productId: '65f8a1e94f1b2c001a4e8d11',
      requestedQuantity: 51
    },
    expectedStatus: 409,
    zodValidation: 'VALIDATED',
    executionTier: 'API',
    rationale: 'Conflict error (409) must be returned when requested items exceed inventory in stock.'
  },
  {
    id: 'TC-08',
    generator: 'BVA/EP Fuzzer',
    targetRoute: 'GET /api/orders/:id/status',
    httpVerb: 'GET',
    partitionRule: 'Equivalence invalid: Malformed MongoDB ObjectId',
    payload: {},
    expectedStatus: 400,
    zodValidation: 'VALIDATED',
    executionTier: 'Unit',
    rationale: 'Passing non-24 hex character id string must be intercepted by param validator.'
  }
];

export const mockRawJsonMatrix = JSON.stringify({
  "$schema": "https://test360.ai/schemas/test-matrix-v1.json",
  "metadata": {
    "engine": "Test360-Coder-1.5B-QLoRA",
    "slmCheckpoint": "qlora-gguf-4bit-v1.4",
    "validationEngine": "zod@3.23.8",
    "prNumber": 48,
    "targetCommit": "a4f91c28f93e921d"
  },
  "routes": [
    {
      "endpoint": "/api/orders/checkout",
      "method": "POST",
      "testCases": [
        {
          "id": "TC-01",
          "partition": "boundary_min",
          "field": "items[0].quantity",
          "injectedValue": 0,
          "expectedHttp": 400,
          "zodVerified": true
        },
        {
          "id": "TC-02",
          "partition": "boundary_min_minus_one",
          "field": "items[0].quantity",
          "injectedValue": -1,
          "expectedHttp": 400,
          "zodVerified": true
        },
        {
          "id": "TC-03",
          "partition": "valid_semantic_payload",
          "expectedHttp": 201,
          "zodVerified": true
        }
      ]
    }
  ]
}, null, 2);

export const mockTemplates = {
  jestUnit: `// Tier 1: Deterministic Jest Unit Test Suite
// Generated via Test360 AST Template Compiler
import { calculateDiscount, aggregateCartWeight } from '../src/services/inventoryService';

describe('Unit Tier — Checkout & Inventory Pure Functions', () => {
  describe('calculateDiscount()', () => {
    it('applies 10% coupon correctly for WINTER2026', () => {
      const result = calculateDiscount(100, 'WINTER2026');
      expect(result).toBe(90);
    });

    it('returns original amount on empty or invalid coupon', () => {
      expect(calculateDiscount(100, '')).toBe(100);
      expect(calculateDiscount(100, 'INVALID_CODE')).toBe(100);
    });

    it('throws TypeError when subtotal is negative', () => {
      expect(() => calculateDiscount(-10, 'WINTER2026')).toThrow();
    });
  });

  describe('aggregateCartWeight()', () => {
    it('accurately aggregates weight across multiple items', () => {
      const items = [{ weightKg: 1.5, qty: 2 }, { weightKg: 0.8, qty: 1 }];
      expect(aggregateCartWeight(items)).toBeCloseTo(3.8);
    });
  });
});`,

  supertestApi: `// Tier 2: Deterministic Supertest + In-Memory MongoDB Test Suite
// Generated via Test360 AST Template Compiler
import request from 'supertest';
import { app } from '../src/app';
import { connectTestDb, closeTestDb, clearTestDb } from './helpers/memoryDb';
import { Product } from '../src/models/Product';

beforeAll(async () => {
  await connectTestDb();
});

afterAll(async () => {
  await closeTestDb();
});

beforeEach(async () => {
  await clearTestDb();
  await Product.create({
    _id: '65f8a1e94f1b2c001a4e8d11',
    sku: 'SKU-HEADPHONES-01',
    name: 'ANC Wireless Headphones',
    price: 29.99,
    stockCount: 50,
    category: 'electronics'
  });
});

describe('Tier 2 — API Integration: POST /api/orders/checkout', () => {
  it('TC-01: rejects order when item quantity is 0 with HTTP 400', async () => {
    const res = await request(app)
      .post('/api/orders/checkout')
      .set('x-idempotency-key', 'idem_tc01_test')
      .send({
        items: [{ productId: '65f8a1e94f1b2c001a4e8d11', quantity: 0, price: 29.99 }],
        paymentMethod: 'credit_card'
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('TC-02: rejects order when item quantity is negative with HTTP 400', async () => {
    const res = await request(app)
      .post('/api/orders/checkout')
      .set('x-idempotency-key', 'idem_tc02_test')
      .send({
        items: [{ productId: '65f8a1e94f1b2c001a4e8d11', quantity: -1, price: 29.99 }],
        paymentMethod: 'credit_card'
      });

    // EXPECTED: 400 Bad Request
    // ACTUAL: 500 Internal Server Error (Isolated Defect in checkoutController.ts:64)
    expect(res.status).toBe(400);
  });

  it('TC-03: successfully creates order on valid payload', async () => {
    const res = await request(app)
      .post('/api/orders/checkout')
      .set('x-idempotency-key', 'idem_tc03_test')
      .send({
        items: [{ productId: '65f8a1e94f1b2c001a4e8d11', quantity: 2, price: 29.99 }],
        paymentMethod: 'credit_card'
      });

    expect(res.status).toBe(201);
    expect(res.body.order).toHaveProperty('orderNumber');
  });
});`,

  playwrightSmoke: `// Tier 3: Deterministic Playwright UI Smoke Suite
// Hardened Headless Chromium with --disable-dev-shm-usage
import { test, expect } from '@playwright/test';

test.describe('Tier 3 — UI Smoke: Checkout Flow', () => {
  test.use({
    viewport: { width: 1280, height: 720 },
    locale: 'en-US'
  });

  test('Guest user adds item and verifies order confirmation summary', async ({ page }) => {
    await page.goto('/cart');
    await page.waitForSelector('[data-testid="cart-item"]');
    
    // Trigger Checkout Stepper
    await page.click('button#proceed-checkout');
    await expect(page).toHaveURL(/.*checkout/);

    // Verify Idempotency and Stock validation status
    const statusPill = page.locator('[data-testid="stock-status"]');
    await expect(statusPill).toContainText('In Stock');
  });
});`,

  autocannonLoad: `// Tier 4: Deterministic Autocannon Load & Concurrency Benchmark
// Execution inside Docker Container (USER node, 100 concurrent workers)
const autocannon = require('autocannon');

async function runBenchmark() {
  const result = await autocannon({
    url: 'http://127.0.0.1:44912/api/orders/checkout',
    connections: 100,
    duration: 10,
    pipelining: 1,
    headers: {
      'content-type': 'application/json',
      'x-idempotency-key': 'autocannon-benchmark-run'
    },
    body: JSON.stringify({
      items: [{ productId: '65f8a1e94f1b2c001a4e8d11', quantity: 1, price: 29.99 }],
      paymentMethod: 'credit_card'
    })
  });

  console.log('Autocannon Benchmark Result:');
  console.log('p90:', result.latency.p90, 'ms');
  console.log('p95:', result.latency.p95, 'ms');
  console.log('p99:', result.latency.p99, 'ms');
  console.log('Req/sec:', result.requests.average);
}

runBenchmark();`
};

export const mockSelfHealingIterations = [
  {
    iteration: 0,
    title: 'Initial Execution in Docker Container',
    status: 'failed',
    summary: 'Container test runner terminated with exit code 1.',
    errorTrace: `AssertionError: Expected HTTP status 201 but received 400 Bad Request
    at Object.<anonymous> (test/supertest.api.test.ts:42:24)
    Error: Missing required header 'x-idempotency-key' in request headers`,
    healingActionTaken: 'Self-Healing Engine parsed stderr trace and identified missing header schema.'
  },
  {
    iteration: 1,
    title: 'Self-Healing Iteration 1 / 2 (Test Parameter Repair)',
    status: 'repaired',
    summary: 'Injected required idempotency key into synthesized JSON matrix & re-compiled Supertest template.',
    healingActionTaken: 'Updated test generator contract with header injection: x-idempotency-key: idem_auto_healed',
    errorTrace: `AssertionError: expected 400 to equal 500
    at Object.<anonymous> (test/supertest.api.test.ts:58:26)
    ValidationError: Product validation failed: stockCount: Cast to Number failed for value "NaN"`
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
];

export const mockTerminalLogs = [
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

export const mockMutants = [
  {
    id: 'M-01',
    file: 'src/controllers/checkoutController.ts',
    line: 42,
    category: 'Operator Inversion',
    originalAstCode: 'if (stock >= item.quantity)',
    mutatedAstCode: 'if (stock > item.quantity)',
    verdict: 'KILLED',
    killingTestSuite: 'Supertest: TC-06 Boundary Max Stock',
    executionDurationMs: 420
  },
  {
    id: 'M-02',
    file: 'src/controllers/checkoutController.ts',
    line: 58,
    category: 'Boundary Change',
    originalAstCode: 'if (item.quantity <= 0)',
    mutatedAstCode: 'if (item.quantity < 0)',
    verdict: 'KILLED',
    killingTestSuite: 'Supertest: TC-01 Boundary Min (qty=0)',
    executionDurationMs: 380
  },
  {
    id: 'M-03',
    file: 'src/controllers/checkoutController.ts',
    line: 64,
    category: 'Condition Removal',
    originalAstCode: 'if (!product) throw new NotFoundError()',
    mutatedAstCode: '/* condition removed */',
    verdict: 'KILLED',
    killingTestSuite: 'Supertest: TC-08 Invalid ProductId',
    executionDurationMs: 310
  },
  {
    id: 'M-04',
    file: 'src/middlewares/validateOrder.ts',
    line: 23,
    category: 'Operator Inversion',
    originalAstCode: 'if (!req.headers[\'x-idempotency-key\'])',
    mutatedAstCode: 'if (req.headers[\'x-idempotency-key\'])',
    verdict: 'KILLED',
    killingTestSuite: 'Supertest: TC-04 Missing Header',
    executionDurationMs: 290
  },
  {
    id: 'M-05',
    file: 'src/middlewares/validateOrder.ts',
    line: 45,
    category: 'Return Value Mutation',
    originalAstCode: 'return res.status(400).json({ error })',
    mutatedAstCode: 'return res.status(200).json({ error })',
    verdict: 'KILLED',
    killingTestSuite: 'Supertest: TC-01 Validation Failure',
    executionDurationMs: 340
  },
  {
    id: 'M-06',
    file: 'src/services/inventoryService.ts',
    line: 18,
    category: 'Operator Inversion',
    originalAstCode: 'const discounted = price - (price * rate)',
    mutatedAstCode: 'const discounted = price + (price * rate)',
    verdict: 'KILLED',
    killingTestSuite: 'Jest Unit: calculateDiscount()',
    executionDurationMs: 150
  },
  {
    id: 'M-07',
    file: 'src/services/inventoryService.ts',
    line: 34,
    category: 'Boundary Change',
    originalAstCode: 'if (couponCode.length >= 6)',
    mutatedAstCode: 'if (couponCode.length > 6)',
    verdict: 'KILLED',
    killingTestSuite: 'Jest Unit: coupon length verification',
    executionDurationMs: 140
  },
  {
    id: 'M-08',
    file: 'src/services/inventoryService.ts',
    line: 88,
    category: 'Statement Deletion',
    originalAstCode: 'product.stockCount -= reservedQuantity;',
    mutatedAstCode: '/* statement deleted */',
    verdict: 'KILLED',
    killingTestSuite: 'Supertest: TC-03 Stock Deduction',
    executionDurationMs: 510
  },
  {
    id: 'M-09',
    file: 'src/models/Order.ts',
    line: 32,
    category: 'Operator Inversion',
    originalAstCode: 'required: true',
    mutatedAstCode: 'required: false',
    verdict: 'SURVIVED',
    killingTestSuite: null,
    executionDurationMs: 620
  },
  {
    id: 'M-10',
    file: 'src/controllers/checkoutController.ts',
    line: 91,
    category: 'Operator Inversion',
    originalAstCode: 'if (paymentResult.status === \'success\')',
    mutatedAstCode: 'if (paymentResult.status !== \'success\')',
    verdict: 'KILLED',
    killingTestSuite: 'Supertest: TC-03 Payment verification',
    executionDurationMs: 440
  },
  {
    id: 'M-11',
    file: 'src/controllers/checkoutController.ts',
    line: 112,
    category: 'Return Value Mutation',
    originalAstCode: 'return res.status(201).json({ order })',
    mutatedAstCode: 'return res.status(204).json({ order })',
    verdict: 'KILLED',
    killingTestSuite: 'Supertest: TC-03 Created status check',
    executionDurationMs: 380
  },
  {
    id: 'M-12',
    file: 'src/middlewares/validateOrder.ts',
    line: 55,
    category: 'Condition Removal',
    originalAstCode: 'if (typeof token !== \'string\')',
    mutatedAstCode: 'if (false)',
    verdict: 'SURVIVED',
    killingTestSuite: null,
    executionDurationMs: 590
  },
  {
    id: 'M-13',
    file: 'src/services/inventoryService.ts',
    line: 104,
    category: 'Operator Inversion',
    originalAstCode: 'if (stockAfterDeduction === 0)',
    mutatedAstCode: 'if (stockAfterDeduction !== 0)',
    verdict: 'KILLED',
    killingTestSuite: 'Supertest: TC-06 Out of Stock flag',
    executionDurationMs: 410
  },
  {
    id: 'M-14',
    file: 'src/routes/orderRoutes.ts',
    line: 19,
    category: 'Statement Deletion',
    originalAstCode: 'orderRouter.use(requireIdempotencyKey);',
    mutatedAstCode: '/* middleware omitted */',
    verdict: 'KILLED',
    killingTestSuite: 'Supertest: TC-04 Idempotency header guard',
    executionDurationMs: 320
  },
  {
    id: 'M-15',
    file: 'src/controllers/checkoutController.ts',
    line: 130,
    category: 'Boundary Change',
    originalAstCode: 'const maxItems = 50;',
    mutatedAstCode: 'const maxItems = 49;',
    verdict: 'KILLED',
    killingTestSuite: 'BVA Fuzzer: Max order items boundary',
    executionDurationMs: 370
  },
  {
    id: 'M-16',
    file: 'src/models/Product.ts',
    line: 25,
    category: 'Operator Inversion',
    originalAstCode: 'min: [0, \'Stock cannot be negative\']',
    mutatedAstCode: 'min: [-1, \'Stock cannot be negative\']',
    verdict: 'KILLED',
    killingTestSuite: 'Supertest: TC-02 Negative bounds',
    executionDurationMs: 490
  },
  {
    id: 'M-17',
    file: 'src/services/inventoryService.ts',
    line: 62,
    category: 'Condition Removal',
    originalAstCode: 'if (product.isArchived) throw new Error(\'Archived\')',
    mutatedAstCode: '/* condition omitted */',
    verdict: 'SURVIVED',
    killingTestSuite: null,
    executionDurationMs: 650
  },
  {
    id: 'M-18',
    file: 'src/controllers/checkoutController.ts',
    line: 77,
    category: 'Return Value Mutation',
    originalAstCode: 'return next(error);',
    mutatedAstCode: 'return next();',
    verdict: 'KILLED',
    killingTestSuite: 'Supertest: Error handling middleware pipe',
    executionDurationMs: 330
  },
  {
    id: 'M-19',
    file: 'src/middlewares/validateOrder.ts',
    line: 72,
    category: 'Operator Inversion',
    originalAstCode: 'const isValid = schema.safeParse(req.body).success;',
    mutatedAstCode: 'const isValid = !schema.safeParse(req.body).success;',
    verdict: 'KILLED',
    killingTestSuite: 'Supertest: TC-03 Zod parsing',
    executionDurationMs: 360
  },
  {
    id: 'M-20',
    file: 'src/controllers/checkoutController.ts',
    line: 148,
    category: 'Statement Deletion',
    originalAstCode: 'await session.commitTransaction();',
    mutatedAstCode: '/* transaction commit omitted */',
    verdict: 'KILLED',
    killingTestSuite: 'Supertest: Mongoose transaction persistence',
    executionDurationMs: 470
  }
];

export const mockAutocannonMetrics = [
  {
    endpoint: '/api/orders/checkout',
    verb: 'POST',
    p90: 38,
    p95: 61,
    p99: 112,
    requestsPerSec: 1842,
    bytesPerSec: '1.4 MB/s',
    totalRequests: 18420,
    errors2xx: 18420,
    errors4xx: 0,
    errors5xx: 0
  },
  {
    endpoint: '/api/orders/:id/status',
    verb: 'GET',
    p90: 12,
    p95: 18,
    p99: 29,
    requestsPerSec: 4120,
    bytesPerSec: '2.8 MB/s',
    totalRequests: 41200,
    errors2xx: 41200,
    errors4xx: 0,
    errors5xx: 0
  },
  {
    endpoint: '/api/orders/reserve-stock',
    verb: 'POST',
    p90: 24,
    p95: 39,
    p99: 72,
    requestsPerSec: 2510,
    bytesPerSec: '1.9 MB/s',
    totalRequests: 25100,
    errors2xx: 25100,
    errors4xx: 0,
    errors5xx: 0
  }
];

export const mockHistoricalPrRuns = [
  { prNumber: 41, title: 'refactor(auth): migrate to argon2 password hashing', commitSha: 'f8101a1', timestamp: '2026-10-12', author: 'sara-lead', mutationKillScore: 78.5, latencyP90: 42, latencyP95: 68, latencyP99: 125, totalDurationSec: 48.2, status: 'passed' },
  { prNumber: 42, title: 'feat(cart): implement multi-currency pricing calculation', commitSha: 'b9412c9', timestamp: '2026-10-13', author: 'ahmed-dev', mutationKillScore: 81.0, latencyP90: 39, latencyP95: 65, latencyP99: 119, totalDurationSec: 50.1, status: 'passed' },
  { prNumber: 43, title: 'fix(mongo): add missing compound index on orderNumber and userId', commitSha: 'c3182d3', timestamp: '2026-10-14', author: 'dev-alinasir', mutationKillScore: 83.2, latencyP90: 31, latencyP95: 52, latencyP99: 98, totalDurationSec: 44.5, status: 'passed' },
  { prNumber: 44, title: 'feat(webhook): add Stripe charge.succeeded idempotent dispatcher', commitSha: 'd4918e7', timestamp: '2026-10-16', author: 'sara-lead', mutationKillScore: 86.4, latencyP90: 45, latencyP95: 74, latencyP99: 140, totalDurationSec: 56.8, status: 'passed' },
  { prNumber: 45, title: 'perf(redis): pipeline inventory decrement locks', commitSha: 'e5021a8', timestamp: '2026-10-17', author: 'ahmed-dev', mutationKillScore: 82.0, latencyP90: 28, latencyP95: 47, latencyP99: 89, totalDurationSec: 42.1, status: 'passed' },
  { prNumber: 46, title: 'fix(tax): compute regional VAT for EU shipping destinations', commitSha: '99201fa', timestamp: '2026-10-18', author: 'sara-lead', mutationKillScore: 84.1, latencyP90: 35, latencyP95: 59, latencyP99: 108, totalDurationSec: 46.3, status: 'passed' },
  { prNumber: 47, title: 'feat(search): text indexing for product catalog endpoints', commitSha: '11928bc', timestamp: '2026-10-19', author: 'dev-alinasir', mutationKillScore: 80.5, latencyP90: 52, latencyP95: 88, latencyP99: 165, totalDurationSec: 61.2, status: 'passed' },
  { prNumber: 48, title: 'feat(checkout): add stock reservation & discount validation', commitSha: 'a4f91c2', timestamp: '2026-10-20', author: 'dev-alinasir', mutationKillScore: 85.0, latencyP90: 38, latencyP95: 61, latencyP99: 112, totalDurationSec: 52.4, status: 'failed' }
];

export const mockDiffCode = {
  original: `import { Request, Response, NextFunction } from 'express';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { reserveInventory } from '../services/inventoryService';

export const processCheckout = async (req: Request, res: Response, next: NextFunction) => {
  const session = await Order.startSession();
  session.startTransaction();

  try {
    const { items, paymentMethod, discountCode } = req.body;

    // Process line items
    for (const item of items) {
      const product = await Product.findById(item.productId).session(session);
      if (!product) {
        throw new Error('Product not found: ' + item.productId);
      }

      // DEFECT AT LINE 64:
      // Direct deduction without verifying quantity > 0
      // Negative quantity causes inventory inflation and unhandled CastError
      product.stockCount -= item.quantity;
      await product.save({ session });
    }

    const order = new Order({
      orderNumber: 'ORD-' + Date.now(),
      userId: req.user?.id || 'anon_guest',
      items,
      totalAmount: items.reduce((sum: number, it: any) => sum + (it.price * it.quantity), 0),
      discountCode,
      idempotencyKey: req.headers['x-idempotency-key']
    });

    await order.save({ session });
    await session.commitTransaction();

    return res.status(201).json({
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    await session.abortTransaction();
    return next(error);
  } finally {
    session.endSession();
  }
};`,

  repaired: `import { Request, Response, NextFunction } from 'express';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { reserveInventory } from '../services/inventoryService';

export const processCheckout = async (req: Request, res: Response, next: NextFunction) => {
  const session = await Order.startSession();
  session.startTransaction();

  try {
    const { items, paymentMethod, discountCode } = req.body;

    // Process line items with rigorous boundary validation
    for (const item of items) {
      // 1-CLICK FIX: Guard against non-positive item quantities before inventory operations
      if (!item.quantity || typeof item.quantity !== 'number' || item.quantity <= 0) {
        await session.abortTransaction();
        return res.status(400).json({
          error: 'Invalid order item quantity. Every item quantity must be a strictly positive integer greater than zero.',
          field: 'items.quantity',
          received: item.quantity
        });
      }

      const product = await Product.findById(item.productId).session(session);
      if (!product) {
        await session.abortTransaction();
        return res.status(404).json({ error: 'Product not found: ' + item.productId });
      }

      // Check stock sufficiency
      if (product.stockCount < item.quantity) {
        await session.abortTransaction();
        return res.status(409).json({
          error: 'Insufficient inventory for SKU: ' + product.sku,
          available: product.stockCount,
          requested: item.quantity
        });
      }

      product.stockCount -= item.quantity;
      await product.save({ session });
    }

    const order = new Order({
      orderNumber: 'ORD-' + Date.now(),
      userId: req.user?.id || 'anon_guest',
      items,
      totalAmount: items.reduce((sum: number, it: any) => sum + (it.price * it.quantity), 0),
      discountCode,
      idempotencyKey: req.headers['x-idempotency-key']
    });

    await order.save({ session });
    await session.commitTransaction();

    return res.status(201).json({
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    await session.abortTransaction();
    return next(error);
  } finally {
    session.endSession();
  }
};`
};
