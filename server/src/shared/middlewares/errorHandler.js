import { env } from '../../config/env.js';

export const errorHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[Error] HTTP ${statusCode}: ${message}`, err.stack);

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    ...(err.details && { details: err.details }),
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
