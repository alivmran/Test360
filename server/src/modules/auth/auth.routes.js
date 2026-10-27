import { Router } from 'express';
import { AuthController } from './auth.controller.js';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/profile/:id', AuthController.getProfile);
router.put('/profile/:id', AuthController.updateProfile);
router.delete('/profile/:id', AuthController.deleteAccount);
router.get('/users', AuthController.listUsers);

export const authRoutes = router;
