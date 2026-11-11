import crypto from 'crypto';
import { User } from './user.model.js';
import { env } from '../../config/env.js';

const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

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
   * Register a new user with dynamic user-provided input
   */
  static async registerUser({ name, email, password, githubUsername, role, organization, bio }) {
    if (!name || !email || !password) {
      throw new Error('Name, email, and password are required fields');
    }

    if (String(password).length < 4) {
      throw new Error('Password must be at least 4 characters long');
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      throw new Error('An account with this email already exists');
    }

    const hashedPassword = hashPassword(String(password));

    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      githubUsername: githubUsername ? githubUsername.trim() : '',
      role: role || 'developer',
      organization: organization ? organization.trim() : '',
      bio: bio || '',
      avatarUrl: githubUsername
        ? `https://github.com/${githubUsername.trim()}.png`
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(name.trim())}&background=18181b&color=fafafa`,
    });

    const userObj = newUser.toObject();
    delete userObj.password;

    return {
      user: userObj,
      token: createSessionToken(newUser),
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

    const userObj = user.toObject();
    delete userObj.password;

    return {
      user: userObj,
      token: createSessionToken(user),
    };
  }

  /**
   * Resolve authenticated user from signed session token
   */
  static async getUserFromToken(token) {
    const decoded = verifySessionToken(token);
    const user = await User.findById(decoded.sub).select('-password');
    if (!user) {
      throw new Error('Authenticated user account not found');
    }
    return user;
  }

  /**
   * Get user profile by MongoDB ObjectId
   */
  static async getUserById(userId) {
    const user = await User.findById(userId).select('-password');
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
    ).select('-password');

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
    return await User.find(filter).select('-password').sort({ createdAt: -1 });
  }
}
