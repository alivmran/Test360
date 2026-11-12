import { Router } from 'express';
import { IngestionController } from './ingestion.controller.js';
import { verifyGitHubWebhookSignature } from '../../shared/middlewares/webhookVerifier.js';

const router = Router();

// GitHub Webhook ingestion endpoints (both standard and aliased)
router.post('/webhook', verifyGitHubWebhookSignature, IngestionController.webhookHandler);
router.post('/github', verifyGitHubWebhookSignature, IngestionController.webhookHandler);

// Live test delivery endpoint for UI / Health checks (<100ms SLA verification)
router.post('/test-delivery', IngestionController.testDelivery);

export const ingestionRoutes = router;
