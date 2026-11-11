import { AuthService } from './auth.service.js';

export class AuthController {
  static async register(req, res) {
    try {
      const result = await AuthService.registerUser(req.body);
      res.status(201).json({
        message: 'Verification code sent to your email address',
        ...result,
      });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  static async verifyEmail(req, res) {
    try {
      const result = await AuthService.verifyEmailCode(req.body);
      res.status(200).json({
        message: 'Email verified successfully',
        ...result,
      });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  static async resendVerification(req, res) {
    try {
      const result = await AuthService.resendVerificationCode(req.body);
      res.status(200).json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  static async login(req, res) {
    try {
      const result = await AuthService.loginUser(req.body);
      res.status(200).json({
        message: 'Logged in successfully',
        ...result,
      });
    } catch (err) {
      const status =
        err.statusCode || (err.message === 'Invalid email or password' ? 401 : 400);
      res.status(status).json({
        error: err.message,
        ...(err.requiresVerification ? { requiresVerification: true, email: err.email } : {}),
      });
    }
  }

  static async me(req, res) {
    try {
      const authHeader = req.headers.authorization || '';
      const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
      if (!token) {
        return res.status(401).json({ error: 'Authentication token required' });
      }
      const user = await AuthService.getUserFromToken(token);
      res.status(200).json({ user });
    } catch (err) {
      res.status(401).json({ error: err.message });
    }
  }

  static async getProfile(req, res) {
    try {
      const user = await AuthService.getUserById(req.params.id);
      res.status(200).json({ user });
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  }

  static async updateProfile(req, res) {
    try {
      const updatedUser = await AuthService.updateUser(req.params.id, req.body);
      res.status(200).json({
        message: 'Profile updated successfully',
        user: updatedUser,
      });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  static async deleteAccount(req, res) {
    try {
      const result = await AuthService.deleteUser(req.params.id);
      res.status(200).json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  static async listUsers(req, res) {
    try {
      const role = req.query.role;
      const users = await AuthService.listUsers(role);
      res.status(200).json({ users });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}
