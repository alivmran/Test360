import { IngestionService } from './ingestion.service.js';

export class IngestionController {
  static async webhookHandler(req, res) {
    const receivedAt = Date.now();
    const payload = req.body;

    const result = await IngestionService.handlePullRequestWebhook(payload, receivedAt);

    res.status(202).json({
      message: 'Webhook received and enqueued for autonomous multi-tier synthesis.',
      ...result,
      slaSatisfied: result.latencyMs < 100,
    });
  }
}
