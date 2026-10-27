import { Router } from 'express';
import { AstController } from './ast.controller.js';

const router = Router();

router.get('/graph', AstController.getCallGraph);
router.get('/:owner/:repo/:commitSha', AstController.getCallGraph);
router.get('/:owner/:repo', AstController.getCallGraph);
router.get('/:repository/:commitSha', AstController.getCallGraph);
router.post('/analyze', AstController.analyzeSnippet);

export const astRoutes = router;

