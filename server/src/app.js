import express from 'express';
import cors from 'cors';
import { apiRouter } from './routes.js';
import { errorHandler } from './shared/middlewares/errorHandler.js';
import { rateLimiter } from './shared/middlewares/rateLimiter.js';

export const createApp = () => {
  const app = express();

  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Hub-Signature-256', 'x-idempotency-key'],
  }));

  // Capture raw request body buffer for HMAC timingSafeEqual verification
  app.use(
    express.json({
      verify: (req, _res, buf) => {
        req.rawBody = buf;
      },
      limit: '5mb',
    })
  );

  app.use(express.urlencoded({ extended: true, limit: '5mb' }));

  app.use('/api', rateLimiter(500, 60000));
  app.use('/api', apiRouter);

  app.use((_req, res) => {
    res.status(404).json({
      error: 'Not Found',
      message: 'The requested API route does not exist.',
    });
  });

  app.use(errorHandler);

  return app;
};
