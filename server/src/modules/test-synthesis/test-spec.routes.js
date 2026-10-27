import { Router } from 'express';
import { TestSpecController } from './test-spec.controller.js';

const router = Router();

router.get('/:prNumber/:commitSha', TestSpecController.getSpecMatrix);
router.post('/validate', TestSpecController.validateJson);

export const testSpecRoutes = router;
