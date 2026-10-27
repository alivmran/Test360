import { Router } from 'express';
import { AstController } from './ast.controller.js';

const router = Router();

router.get('/:repository/:commitSha', AstController.getCallGraph);
router.post('/analyze', AstController.analyzeSnippet);

export const astRoutes = router;
