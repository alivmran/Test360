import nodemailer from 'nodemailer';
import { env } from '../../config/env.js';

let cachedTransporter = null;

const escapeHtml = (str = '') =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export const isSmtpConfigured = () => Boolean(env.SMTP_USER && env.SMTP_PASS);

const getTransporter = () => {
  if (!isSmtpConfigured()) {
    return null;
  }
  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: {
        user: env.SMTP_USER.trim(),
        pass: env.SMTP_PASS.replace(/\s+/g, ''),
      },
    });
  }
  return cachedTransporter;
};

/**
 * Sends a 6-digit email verification OTP via Nodemailer SMTP.
 * In non-production when SMTP credentials are not configured yet,
 * logs the verification code cleanly to the server terminal so local auth remains testable.
 */
export const sendVerificationCodeEmail = async ({ to, name, code }) => {
  const transporter = getTransporter();
  if (!transporter) {
    if (env.NODE_ENV === 'production') {
      throw new Error('Email service is not configured on the server');
    }
    console.log(
      `\n[Email Verification - Dev Fallback] To: ${to} | Code: ${code} (Configure SMTP_USER & SMTP_PASS in server/.env to send real emails)\n`
    );
    return { delivered: false, mode: 'console' };
  }

  const fromAddress = env.MAIL_FROM || `Test360 AI <${env.SMTP_USER}>`;
  const displayName = name ? escapeHtml(name) : 'there';

  const info = await transporter.sendMail({
    from: fromAddress,
    to,
    subject: `${code} is your Test360 AI verification code`,
    text: `Hi ${name || 'there'},\n\nYour Test360 AI verification code is: ${code}\n\nThis code expires in 10 minutes. If you did not request an account, you can ignore this email.\n`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background:#09090b; color:#fafafa; padding:32px;">
        <div style="max-width:480px; margin:0 auto; background:#121215; border:1px solid #27272a; border-radius:12px; padding:28px;">
          <div style="font-size:16px; font-weight:700; color:#fafafa; margin-bottom:12px;">Test360 AI</div>
          <p style="font-size:14px; color:#a1a1aa; line-height:1.5; margin:0 0 20px;">
            Hi ${displayName}, enter this verification code to finish creating your workspace account:
          </p>
          <div style="background:#09090b; border:1px solid #27272a; border-radius:8px; padding:16px; text-align:center; font-family:monospace; font-size:28px; font-weight:700; letter-spacing:8px; color:#fafafa;">
            ${code}
          </div>
          <p style="font-size:12px; color:#71717a; margin:20px 0 0;">
            This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      </div>
    `,
  });

  return { delivered: true, mode: 'smtp', messageId: info.messageId };
};
