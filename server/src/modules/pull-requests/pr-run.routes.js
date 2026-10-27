import { Router } from 'express';
import { PullRequestController } from './pr-run.controller.js';

const router = Router();

router.get('/history', PullRequestController.getHistoricalRuns);
router.get('/latest', PullRequestController.getLatestRun);
router.get('/:owner/:repo/:prNumber', PullRequestController.getLatestRun);
router.get('/:owner/:repo', PullRequestController.getLatestRun);
router.get('/:repository/:prNumber', PullRequestController.getLatestRun);
router.post('/rerun', PullRequestController.rerun);

export const pullRequestRoutes = router;

