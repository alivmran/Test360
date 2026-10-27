import { MutationService } from './mutation.service.js';

export class MutationController {
  static async getReport(req, res) {
    const repository = req.query.repository || 'szabist-se/ecommerce-express-api';
    const prNumber = req.query.prNumber ? Number(req.query.prNumber) : 48;
    const report = await MutationService.getReport(repository, prNumber);

    res.json(report);
  }
}
