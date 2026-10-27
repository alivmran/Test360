import { Router } from 'express';
import { ingestionRoutes } from './modules/ingestion/ingestion.routes.js';
import { repositoryRoutes } from './modules/repositories/repository.routes.js';
import { pullRequestRoutes } from './modules/pull-requests/pr-run.routes.js';
import { astRoutes } from './modules/ast-analysis/ast.routes.js';
import { testSpecRoutes } from './modules/test-synthesis/test-spec.routes.js';
import { sandboxRoutes } from './modules/docker-sandbox/sandbox.routes.js';
import { mutationRoutes } from './modules/mutation-testing/mutation.routes.js';
import { diagnosticsRoutes } from './modules/diagnostics-repair/diagnostics.routes.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { env } from './config/env.js';

const router = Router();

// Modular domain routes
router.use('/auth', authRoutes);
router.use('/ingestion', ingestionRoutes);
router.use('/repositories', repositoryRoutes);
router.use('/pull-requests', pullRequestRoutes);
router.use('/ast', astRoutes);
router.use('/test-specs', testSpecRoutes);
router.use('/sandbox', sandboxRoutes);
router.use('/mutations', mutationRoutes);
router.use('/diagnostics', diagnosticsRoutes);

// Global telemetry & health endpoint
router.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    engine: 'Test360 AI Autonomous Multi-Tier Test Synthesis Platform',
    stack: 'MERN (MongoDB, Express, React, Node.js)',
    version: '1.0.0',
    slm: {
      model: env.SLM_MODEL_NAME,
      ollamaUrl: env.OLLAMA_BASE_URL,
      quantization: '4-bit GGUF',
    },
    sandbox: {
      user: env.DOCKER_USER,
      memoryLimit: env.DOCKER_MEMORY_LIMIT,
      cpuLimit: env.DOCKER_CPU_LIMIT,
      capabilities: '--cap-drop=ALL',
    },
    webhookSla: '<100ms',
  });
});

export const apiRouter = router;
