import { Router } from 'express';
import { DiagnosticsController } from './diagnostics.controller.js';

const router = Router();

router.get('/triage', DiagnosticsController.getTriage);
router.post('/apply-repair', DiagnosticsController.approveRepair);

export const diagnosticsRoutes = router;
