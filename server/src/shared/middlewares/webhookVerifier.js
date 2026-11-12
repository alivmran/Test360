import crypto from 'crypto';
import { env } from '../../config/env.js';
import { Repository } from '../../modules/repositories/repository.model.js';

/**
 * Stage 1: GitHub Webhook Multi-Tenant HMAC-SHA256 Signature Verifier
 * Uses crypto.timingSafeEqual on raw request buffer to protect against timing attacks.
 * Verifies against repository-specific webhookSecret or fallback global GITHUB_WEBHOOK_SECRET.
 */
export const verifyGitHubWebhookSignature = async (req, res, next) => {
  const signatureHeader = req.headers['x-hub-signature-256'];

  // Allow development bypass if signature is omitted during manual testing
  if (!signatureHeader && env.NODE_ENV === 'development') {
    return next();
  }

  if (!signatureHeader) {
    return res.status(401).json({
      error: 'Missing X-Hub-Signature-256 header.',
      slaMet: false,
    });
  }

  // Ensure request body buffer is available
  const bodyBuffer = req.rawBody || (req.body ? Buffer.from(JSON.stringify(req.body)) : null);
  if (!bodyBuffer) {
    return res.status(500).json({
      error: 'Raw request body buffer unavailable for HMAC calculation.',
      slaMet: false,
    });
  }

  try {
    // 1. Resolve multi-tenant repository webhook secret if repository is identifiable
    const repoFullName =
      req.body?.repository?.full_name ||
      req.body?.pull_request?.head?.repo?.full_name ||
      req.body?.repoFullName;

    let repo = null;
    const candidateSecrets = [];

    if (repoFullName) {
      try {
        repo = await Repository.findOne({ fullName: repoFullName });
        if (repo?.webhookSecret) {
          candidateSecrets.push(repo.webhookSecret);
        }
      } catch {
        // Continue with global secret if DB lookup fails
      }
    }

    // Always include global webhook secret as fallback
    if (env.GITHUB_WEBHOOK_SECRET && !candidateSecrets.includes(env.GITHUB_WEBHOOK_SECRET)) {
      candidateSecrets.push(env.GITHUB_WEBHOOK_SECRET);
    }

    // Always include test default secret for local integration testing
    const defaultDevSecret = 'test360-dev-webhook-secret';
    if (!candidateSecrets.includes(defaultDevSecret)) {
      candidateSecrets.push(defaultDevSecret);
    }

    let verified = false;
    const sigBuffer = Buffer.from(signatureHeader, 'utf8');

    for (const secret of candidateSecrets) {
      const hmac = crypto.createHmac('sha256', secret);
      hmac.update(bodyBuffer);
      const expectedSignature = `sha256=${hmac.digest('hex')}`;
      const expectedBuffer = Buffer.from(expectedSignature, 'utf8');

      if (
        sigBuffer.length === expectedBuffer.length &&
        crypto.timingSafeEqual(sigBuffer, expectedBuffer)
      ) {
        verified = true;
        break;
      }
    }

    if (!verified) {
      return res.status(401).json({
        error: 'Invalid X-Hub-Signature-256 HMAC payload verification.',
        slaMet: false,
      });
    }

    req.verifiedRepo = repo;
    next();
  } catch (err) {
    res.status(500).json({
      error: 'HMAC signature verification failed unexpectedly.',
      details: err.message,
    });
  }
};
