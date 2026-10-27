import { AuthService } from './auth.service.js';

export class AuthController {
  static async register(req, res) {
    try {
      const result = await AuthService.registerUser(req.body);
      res.status(201).json({
        message: 'User registered successfully',
        ...result,
      });
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
      res.status(400).json({ error: err.message });
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
