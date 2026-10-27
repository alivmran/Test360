import { Router } from 'express';
import { MutationController } from './mutation.controller.js';

const router = Router();

router.get('/report', MutationController.getReport);

export const mutationRoutes = router;
