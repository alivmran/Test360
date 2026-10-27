import { Router } from 'express';
import { IngestionController } from './ingestion.controller.js';
import { verifyGitHubWebhookSignature } from '../../shared/middlewares/webhookVerifier.js';

const router = Router();

router.post('/webhook', verifyGitHubWebhookSignature, IngestionController.webhookHandler);

export const ingestionRoutes = router;
