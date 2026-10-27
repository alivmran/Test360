import crypto from 'crypto';
import { env } from '../../config/env.js';

/**
 * Stage 1: GitHub Webhook HMAC-SHA256 Signature Verifier
 * Uses crypto.timingSafeEqual on raw request buffer to protect against timing attacks.
 */
export const verifyGitHubWebhookSignature = (req, res, next) => {
  const signatureHeader = req.headers['x-hub-signature-256'];

  if (!signatureHeader && env.NODE_ENV === 'development') {
    return next();
  }

  if (!signatureHeader) {
    return res.status(401).json({
      error: 'Missing X-Hub-Signature-256 header.',
      slaMet: false,
    });
  }

  if (!req.rawBody) {
    return res.status(500).json({
      error: 'Raw request body buffer unavailable for HMAC calculation.',
      slaMet: false,
    });
  }

  try {
    const hmac = crypto.createHmac('sha256', env.GITHUB_WEBHOOK_SECRET);
    hmac.update(req.rawBody);
    const expectedSignature = `sha256=${hmac.digest('hex')}`;

    const sigBuffer = Buffer.from(signatureHeader, 'utf8');
    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');

    if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
      return res.status(401).json({
        error: 'Invalid X-Hub-Signature-256 HMAC payload verification.',
        slaMet: false,
      });
    }

    next();
  } catch (err) {
    res.status(500).json({
      error: 'HMAC signature verification failed unexpectedly.',
      details: err.message,
    });
  }
};
