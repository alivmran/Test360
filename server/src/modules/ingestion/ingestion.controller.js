import { IngestionService } from './ingestion.service.js';

export class IngestionController {
  static async webhookHandler(req, res) {
    const receivedAt = Date.now();
    const payload = req.body;
    const eventType = req.headers['x-github-event'] || (payload?.zen ? 'ping' : 'pull_request');

    const result = await IngestionService.handlePullRequestWebhook(payload, receivedAt, eventType);

    const isPing = result.status === 'pong' || eventType === 'ping';
    res.status(isPing ? 200 : 202).json({
      message: isPing
        ? 'GitHub Webhook Ping received and handshake verified.'
        : 'Webhook received and enqueued for autonomous multi-tier synthesis.',
      ...result,
      slaSatisfied: result.latencyMs < 100,
    });
  }

  static async testDelivery(req, res) {
    try {
      const startTime = Date.now();
      const { repoFullName, event = 'ping' } = req.body;
      if (!repoFullName) {
        return res.status(400).json({ error: 'repoFullName is required to test delivery.' });
      }

      const result = await IngestionService.testDeliveryHandshake(repoFullName, event, startTime);
      res.status(200).json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}
