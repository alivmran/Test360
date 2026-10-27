const ipCache = new Map();

/**
 * High-performance in-memory rate limiter with sliding window
 */
export const rateLimiter = (maxRequests = 100, windowMs = 60000) => {
  return (req, res, next) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    const record = ipCache.get(ip);

    if (!record || now > record.resetAt) {
      ipCache.set(ip, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (record.count >= maxRequests) {
      res.status(429).json({
        error: 'Too Many Requests',
        message: `Exceeded ${maxRequests} requests per ${windowMs / 1000}s limit.`,
        retryAfterMs: record.resetAt - now,
      });
      return;
    }

    record.count++;
    next();
  };
};
