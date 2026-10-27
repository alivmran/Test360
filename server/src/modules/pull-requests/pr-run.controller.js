import { PullRequestService } from './pr-run.service.js';

export class PullRequestController {
  static async getLatestRun(req, res) {
    let repository = req.query.repository;
    if (!repository && req.params.owner && req.params.repo) {
      repository = `${req.params.owner}/${req.params.repo}`;
    } else if (!repository && req.params.repository) {
      repository = decodeURIComponent(req.params.repository);
    }
    const prNumber = req.params.prNumber
      ? Number(req.params.prNumber)
      : req.query.prNumber
      ? Number(req.query.prNumber)
      : null;

    const run = await PullRequestService.getLatestRun(repository, prNumber);
    res.json({ run });
  }

  static async getHistoricalRuns(req, res) {
    const repository = String(req.query.repository || 'szabist-se/ecommerce-express-api');
    const runs = await PullRequestService.listHistoricalRuns(repository);
    res.json({ historicalRuns: runs });
  }


  static async rerun(req, res) {
    const { repository, prNumber, commitSha, branch, author } = req.body;
    const jobId = await PullRequestService.triggerRerun({
      repository: repository || 'szabist-se/ecommerce-express-api',
      prNumber: Number(prNumber) || 48,
      commitSha: commitSha || 'a4f91c28f93e921d0a5b82141512b918ac5d901f',
      branch: branch || 'feat/checkout-stock-v2',
      baseBranch: 'main',
      author: author || 'dev-alinasir',
      modifiedFiles: ['src/controllers/checkoutController.ts', 'src/middlewares/validateOrder.ts'],
    });

    res.status(202).json({
      message: 'Pipeline rerun triggered successfully.',
      jobId,
      status: 'queued',
    });
  }
}
