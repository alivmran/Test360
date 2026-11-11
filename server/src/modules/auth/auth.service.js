import crypto from 'crypto';
import { User } from './user.model.js';
import { env } from '../../config/env.js';
import { sendVerificationCodeEmail } from './email.service.js';

const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const VERIFICATION_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 30 * 1000;

export const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
};

export const verifyPassword = (password, storedPassword) => {
  if (!password || !storedPassword) return false;
  if (!storedPassword.includes(':')) {
    return password === storedPassword;
  }
  const [salt, keyHex] = storedPassword.split(':');
  if (!salt || !keyHex) return false;
  const keyBuffer = Buffer.from(keyHex, 'hex');
  const derivedBuffer = crypto.scryptSync(password, salt, 64);
  if (keyBuffer.length !== derivedBuffer.length) return false;
  return crypto.timingSafeEqual(keyBuffer, derivedBuffer);
};

const generateVerificationCode = () => String(crypto.randomInt(100000, 1000000));

const hashVerificationCode = (code) =>
  crypto.createHash('sha256').update(String(code).trim()).digest('hex');

const sanitizeUser = (userDoc) => {
  const userObj = typeof userDoc.toObject === 'function' ? userDoc.toObject() : { ...userDoc };
  delete userObj.password;
  delete userObj.emailVerificationCodeHash;
  delete userObj.emailVerificationExpiresAt;
  delete userObj.emailVerificationSentAt;
  return userObj;
};

const createSessionToken = (user) => {
  const payload = Buffer.from(
    JSON.stringify({
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
      exp: Date.now() + TOKEN_TTL_MS,
    })
  ).toString('base64url');

  const signature = crypto
    .createHmac('sha256', env.GITHUB_WEBHOOK_SECRET)
    .update(payload)
    .digest('base64url');

  return `${payload}.${signature}`;
};

const verifySessionToken = (token) => {
  if (!token || typeof token !== 'string' || !token.includes('.')) {
    throw new Error('Invalid session token');
  }
  const [payload, signature] = token.split('.');
  if (!payload || !signature) {
    throw new Error('Invalid session token');
  }

  const expectedSignature = crypto
    .createHmac('sha256', env.GITHUB_WEBHOOK_SECRET)
    .update(payload)
    .digest('base64url');

  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expectedSignature);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    throw new Error('Invalid session signature');
  }

  const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  if (!decoded.exp || decoded.exp < Date.now()) {
    throw new Error('Session expired');
  }
  return decoded;
};

export class AuthService {
  /**
   * Register a new user and send a 6-digit email verification code via Nodemailer.
   */
  static async registerUser({ name, email, password, githubUsername, role, organization, bio }) {
    if (!name || !email || !password) {
      throw new Error('Name, email, and password are required fields');
    }

    if (String(password).length < 4) {
      throw new Error('Password must be at least 4 characters long');
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser && existingUser.isEmailVerified !== false) {
      throw new Error('An account with this email already exists');
    }

    const hashedPassword = hashPassword(String(password));
    const verificationCode = generateVerificationCode();
    const codeHash = hashVerificationCode(verificationCode);
    const expiresAt = new Date(Date.now() + VERIFICATION_TTL_MS);
    const avatarUrl = githubUsername
      ? `https://github.com/${githubUsername.trim()}.png`
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(name.trim())}&background=18181b&color=fafafa`;

    let userRecord;
    if (existingUser && existingUser.isEmailVerified === false) {
      existingUser.name = name.trim();
      existingUser.password = hashedPassword;
      existingUser.githubUsername = githubUsername ? githubUsername.trim() : '';
      existingUser.role = role || 'developer';
      existingUser.organization = organization ? organization.trim() : '';
      existingUser.bio = bio || '';
      existingUser.avatarUrl = avatarUrl;
      existingUser.emailVerificationCodeHash = codeHash;
      existingUser.emailVerificationExpiresAt = expiresAt;
      existingUser.emailVerificationSentAt = new Date();
      userRecord = await existingUser.save();
    } else {
      userRecord = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        githubUsername: githubUsername ? githubUsername.trim() : '',
        role: role || 'developer',
        organization: organization ? organization.trim() : '',
        bio: bio || '',
        avatarUrl,
        isEmailVerified: false,
        emailVerificationCodeHash: codeHash,
        emailVerificationExpiresAt: expiresAt,
        emailVerificationSentAt: new Date(),
      });
    }

    const emailResult = await sendVerificationCodeEmail({
      to: userRecord.email,
      name: userRecord.name,
      code: verificationCode,
    });

    return {
      requiresVerification: true,
      email: userRecord.email,
      deliveryMode: emailResult.mode,
      user: sanitizeUser(userRecord),
    };
  }

  /**
   * Verify a user's 6-digit email OTP code and issue an authenticated session token.
   */
  static async verifyEmailCode({ email, code }) {
    if (!email || !code) {
      throw new Error('Email and verification code are required');
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      throw new Error('Account not found');
    }

    if (user.isEmailVerified !== false) {
      throw new Error('Email is already verified. Please sign in.');
    }

    if (
      !user.emailVerificationCodeHash ||
      !user.emailVerificationExpiresAt ||
      user.emailVerificationExpiresAt.getTime() < Date.now()
    ) {
      throw new Error('Verification code has expired. Please request a new code.');
    }

    const providedHash = Buffer.from(hashVerificationCode(code), 'hex');
    const storedHash = Buffer.from(user.emailVerificationCodeHash, 'hex');
    if (
      providedHash.length !== storedHash.length ||
      !crypto.timingSafeEqual(providedHash, storedHash)
    ) {
      throw new Error('Invalid verification code');
    }

    user.isEmailVerified = true;
    user.emailVerificationCodeHash = '';
    user.emailVerificationExpiresAt = null;
    await user.save();

    return {
      user: sanitizeUser(user),
      token: createSessionToken(user),
    };
  }

  /**
   * Resend a fresh 6-digit email verification code with a short cooldown.
   */
  static async resendVerificationCode({ email }) {
    if (!email) {
      throw new Error('Email is required');
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      throw new Error('Account not found');
    }

    if (user.isEmailVerified !== false) {
      throw new Error('Email is already verified. Please sign in.');
    }

    if (
      user.emailVerificationSentAt &&
      Date.now() - user.emailVerificationSentAt.getTime() < RESEND_COOLDOWN_MS
    ) {
      throw new Error('Please wait a few seconds before requesting a new code.');
    }

    const verificationCode = generateVerificationCode();
    user.emailVerificationCodeHash = hashVerificationCode(verificationCode);
    user.emailVerificationExpiresAt = new Date(Date.now() + VERIFICATION_TTL_MS);
    user.emailVerificationSentAt = new Date();
    await user.save();

    const emailResult = await sendVerificationCodeEmail({
      to: user.email,
      name: user.name,
      code: verificationCode,
    });

    return {
      message: 'Verification code sent',
      email: user.email,
      deliveryMode: emailResult.mode,
    };
  }

  /**
   * Authenticate user against MongoDB stored credentials
   */
  static async loginUser({ email, password, githubUsername }) {
    if (!password) {
      throw new Error('Email and password are required');
    }

    const query = {};
    if (email) {
      query.email = email.toLowerCase().trim();
    } else if (githubUsername) {
      query.githubUsername = githubUsername.trim();
    } else {
      throw new Error('Please provide an email address to sign in');
    }

    const user = await User.findOne(query);
    if (!user || !user.password || !verifyPassword(String(password), user.password)) {
      throw new Error('Invalid email or password');
    }

    if (user.isEmailVerified === false) {
      const err = new Error('Please verify your email address before signing in.');
      err.statusCode = 403;
      err.requiresVerification = true;
      err.email = user.email;
      throw err;
    }

    return {
      user: sanitizeUser(user),
      token: createSessionToken(user),
    };
  }

  /**
   * Resolve authenticated user from signed session token
   */
  static async getUserFromToken(token) {
    const decoded = verifySessionToken(token);
    const user = await User.findById(decoded.sub).select('-password -emailVerificationCodeHash');
    if (!user) {
      throw new Error('Authenticated user account not found');
    }
    return user;
  }

  /**
   * Get user profile by MongoDB ObjectId
   */
  static async getUserById(userId) {
    const user = await User.findById(userId).select('-password -emailVerificationCodeHash');
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  /**
   * Update user profile dynamically based on request body
   */
  static async updateUser(userId, updates) {
    const allowedUpdates = ['name', 'githubUsername', 'role', 'organization', 'bio', 'avatarUrl'];
    const filteredUpdates = {};

    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) {
        filteredUpdates[key] = updates[key];
      }
    }

    if (filteredUpdates.githubUsername && !updates.avatarUrl) {
      filteredUpdates.avatarUrl = `https://github.com/${filteredUpdates.githubUsername.trim()}.png`;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: filteredUpdates },
      { new: true, runValidators: true }
    ).select('-password -emailVerificationCodeHash');

    if (!updatedUser) {
      throw new Error('User not found for update');
    }

    return updatedUser;
  }

  /**
   * Delete user by ID
   */
  static async deleteUser(userId) {
    const result = await User.findByIdAndDelete(userId);
    if (!result) {
      throw new Error('User not found for deletion');
    }
    return { success: true, message: 'User account removed successfully' };
  }

  /**
   * List all registered users from MongoDB
   */
  static async listUsers(role) {
    const filter = {};
    if (role) filter.role = role;
    return await User.find(filter)
      .select('-password -emailVerificationCodeHash')
      .sort({ createdAt: -1 });
  }
}
