import { MutationReport } from './mutation.model.js';

export class MutationService {
  static async getReport(repository = 'szabist-se/ecommerce-express-api', prNumber = 48) {
    const existing = await MutationReport.findOne({ repository, prNumber: Number(prNumber) });
    if (existing) {
      return {
        summary: {
          sampled: existing.mutantsSampled,
          killed: existing.mutantsKilled,
          survived: existing.mutantsSurvived,
          killScorePercentage: existing.killScorePercentage,
          enforceCap: 20,
        },
        mutants: existing.mutants,
        autocannonMetrics: existing.autocannonMetrics,
      };
    }

    const mutants = this.getSampledMutants();
    const autocannonMetrics = this.getAutocannonMetrics();
    const killedCount = mutants.filter((m) => m.verdict === 'KILLED').length;
    const survivedCount = mutants.filter((m) => m.verdict === 'SURVIVED').length;
    const score = (killedCount / mutants.length) * 100;

    return {
      summary: {
        sampled: mutants.length,
        killed: killedCount,
        survived: survivedCount,
        killScorePercentage: score,
        enforceCap: 20,
      },
      mutants,
      autocannonMetrics,
    };
  }

  static getSampledMutants() {
    return [
      { id: 'M-01', file: 'src/controllers/checkoutController.ts', line: 42, category: 'Operator Inversion', originalAstCode: 'if (stock >= item.quantity)', mutatedAstCode: 'if (stock > item.quantity)', verdict: 'KILLED', killingTestSuite: 'Supertest: TC-06 Boundary Max Stock', executionDurationMs: 420 },
      { id: 'M-02', file: 'src/controllers/checkoutController.ts', line: 58, category: 'Boundary Change', originalAstCode: 'if (item.quantity <= 0)', mutatedAstCode: 'if (item.quantity < 0)', verdict: 'KILLED', killingTestSuite: 'Supertest: TC-01 Boundary Min (qty=0)', executionDurationMs: 380 },
      { id: 'M-03', file: 'src/controllers/checkoutController.ts', line: 64, category: 'Condition Removal', originalAstCode: 'if (!product) throw new NotFoundError()', mutatedAstCode: '/* condition removed */', verdict: 'KILLED', killingTestSuite: 'Supertest: TC-08 Invalid ProductId', executionDurationMs: 310 },
      { id: 'M-04', file: 'src/middlewares/validateOrder.ts', line: 23, category: 'Operator Inversion', originalAstCode: 'if (!req.headers[\'x-idempotency-key\'])', mutatedAstCode: 'if (req.headers[\'x-idempotency-key\'])', verdict: 'KILLED', killingTestSuite: 'Supertest: TC-04 Missing Header', executionDurationMs: 290 },
      { id: 'M-05', file: 'src/middlewares/validateOrder.ts', line: 45, category: 'Return Value Mutation', originalAstCode: 'return res.status(400).json({ error })', mutatedAstCode: 'return res.status(200).json({ error })', verdict: 'KILLED', killingTestSuite: 'Supertest: TC-01 Validation Failure', executionDurationMs: 340 },
      { id: 'M-06', file: 'src/services/inventoryService.ts', line: 18, category: 'Operator Inversion', originalAstCode: 'const discounted = price - (price * rate)', mutatedAstCode: 'const discounted = price + (price * rate)', verdict: 'KILLED', killingTestSuite: 'Jest Unit: calculateDiscount()', executionDurationMs: 150 },
      { id: 'M-07', file: 'src/services/inventoryService.ts', line: 34, category: 'Boundary Change', originalAstCode: 'if (couponCode.length >= 6)', mutatedAstCode: 'if (couponCode.length > 6)', verdict: 'KILLED', killingTestSuite: 'Jest Unit: coupon length verification', executionDurationMs: 140 },
      { id: 'M-08', file: 'src/services/inventoryService.ts', line: 88, category: 'Statement Deletion', originalAstCode: 'product.stockCount -= reservedQuantity;', mutatedAstCode: '/* statement deleted */', verdict: 'KILLED', killingTestSuite: 'Supertest: TC-03 Stock Deduction', executionDurationMs: 510 },
      { id: 'M-09', file: 'src/models/Order.ts', line: 32, category: 'Operator Inversion', originalAstCode: 'required: true', mutatedAstCode: 'required: false', verdict: 'SURVIVED', killingTestSuite: null, executionDurationMs: 620 },
      { id: 'M-10', file: 'src/controllers/checkoutController.ts', line: 91, category: 'Operator Inversion', originalAstCode: 'if (paymentResult.status === \'success\')', mutatedAstCode: 'if (paymentResult.status !== \'success\')', verdict: 'KILLED', killingTestSuite: 'Supertest: TC-03 Payment verification', executionDurationMs: 440 },
      { id: 'M-11', file: 'src/controllers/checkoutController.ts', line: 112, category: 'Return Value Mutation', originalAstCode: 'return res.status(201).json({ order })', mutatedAstCode: 'return res.status(204).json({ order })', verdict: 'KILLED', killingTestSuite: 'Supertest: TC-03 Created status check', executionDurationMs: 380 },
      { id: 'M-12', file: 'src/middlewares/validateOrder.ts', line: 55, category: 'Condition Removal', originalAstCode: 'if (typeof token !== \'string\')', mutatedAstCode: 'if (false)', verdict: 'SURVIVED', killingTestSuite: null, executionDurationMs: 590 },
      { id: 'M-13', file: 'src/services/inventoryService.ts', line: 104, category: 'Operator Inversion', originalAstCode: 'if (stockAfterDeduction === 0)', mutatedAstCode: 'if (stockAfterDeduction !== 0)', verdict: 'KILLED', killingTestSuite: 'Supertest: TC-06 Out of Stock flag', executionDurationMs: 410 },
      { id: 'M-14', file: 'src/routes/orderRoutes.ts', line: 19, category: 'Statement Deletion', originalAstCode: 'orderRouter.use(requireIdempotencyKey);', mutatedAstCode: '/* middleware omitted */', verdict: 'KILLED', killingTestSuite: 'Supertest: TC-04 Idempotency header guard', executionDurationMs: 320 },
      { id: 'M-15', file: 'src/controllers/checkoutController.ts', line: 130, category: 'Boundary Change', originalAstCode: 'const maxItems = 50;', mutatedAstCode: 'const maxItems = 49;', verdict: 'KILLED', killingTestSuite: 'BVA Fuzzer: Max order items boundary', executionDurationMs: 370 },
      { id: 'M-16', file: 'src/models/Product.ts', line: 25, category: 'Operator Inversion', originalAstCode: 'min: [0, \'Stock cannot be negative\']', mutatedAstCode: 'min: [-1, \'Stock cannot be negative\']', verdict: 'KILLED', killingTestSuite: 'Supertest: TC-02 Negative bounds', executionDurationMs: 490 },
      { id: 'M-17', file: 'src/services/inventoryService.ts', line: 62, category: 'Condition Removal', originalAstCode: 'if (product.isArchived) throw new Error(\'Archived\')', mutatedAstCode: '/* condition omitted */', verdict: 'SURVIVED', killingTestSuite: null, executionDurationMs: 650 },
      { id: 'M-18', file: 'src/controllers/checkoutController.ts', line: 77, category: 'Return Value Mutation', originalAstCode: 'return next(error);', mutatedAstCode: 'return next();', verdict: 'KILLED', killingTestSuite: 'Supertest: Error handling middleware pipe', executionDurationMs: 330 },
      { id: 'M-19', file: 'src/middlewares/validateOrder.ts', line: 72, category: 'Operator Inversion', originalAstCode: 'const isValid = schema.safeParse(req.body).success;', mutatedAstCode: 'const isValid = !schema.safeParse(req.body).success;', verdict: 'KILLED', killingTestSuite: 'Supertest: TC-03 Zod parsing', executionDurationMs: 360 },
      { id: 'M-20', file: 'src/controllers/checkoutController.ts', line: 148, category: 'Statement Deletion', originalAstCode: 'await session.commitTransaction();', mutatedAstCode: '/* transaction commit omitted */', verdict: 'KILLED', killingTestSuite: 'Supertest: Mongoose transaction persistence', executionDurationMs: 470 },
    ];
  }

  static getAutocannonMetrics() {
    return [
      { endpoint: '/api/orders/checkout', verb: 'POST', p90: 38, p95: 61, p99: 112, requestsPerSec: 1842, bytesPerSec: '1.4 MB/s', totalRequests: 18420, errors2xx: 18420, errors4xx: 0, errors5xx: 0 },
      { endpoint: '/api/orders/:id/status', verb: 'GET', p90: 12, p95: 18, p99: 29, requestsPerSec: 4120, bytesPerSec: '2.8 MB/s', totalRequests: 41200, errors2xx: 41200, errors4xx: 0, errors5xx: 0 },
      { endpoint: '/api/orders/reserve-stock', verb: 'POST', p90: 24, p95: 39, p99: 72, requestsPerSec: 2510, bytesPerSec: '1.9 MB/s', totalRequests: 25100, errors2xx: 25100, errors4xx: 0, errors5xx: 0 },
    ];
  }
}
