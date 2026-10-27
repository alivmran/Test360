import { Router } from 'express';
import { RepositoryController } from './repository.controller.js';

const router = Router();

router.get('/', RepositoryController.list);
router.post('/', RepositoryController.create);
router.get('/:owner/:repo', RepositoryController.get);
router.put('/:owner/:repo/config', RepositoryController.updateConfig);
router.delete('/:owner/:repo', RepositoryController.delete);

export const repositoryRoutes = router;
