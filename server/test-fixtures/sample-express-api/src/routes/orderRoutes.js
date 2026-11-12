import { Router } from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import {
  createOrderHandler,
  getOrderHandler,
  updateOrderStatusHandler,
  cancelOrderHandler,
} from '../controllers/orderController.js';

const router = Router();

// Routes for order management
router.post('/api/orders', verifyToken, createOrderHandler);
router.get('/api/orders/:id', verifyToken, getOrderHandler);
router.put('/api/orders/:id/status', verifyToken, updateOrderStatusHandler);
router.delete('/api/orders/:id', verifyToken, cancelOrderHandler);

export default router;

