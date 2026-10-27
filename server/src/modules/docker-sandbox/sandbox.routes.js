import { Router } from 'express';
import { SandboxController } from './sandbox.controller.js';

const router = Router();

router.get('/telemetry', SandboxController.getTelemetry);
router.get('/logs', SandboxController.streamLogs);

export const sandboxRoutes = router;
