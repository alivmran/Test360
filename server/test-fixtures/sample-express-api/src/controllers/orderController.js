import { reserveInventory, releaseInventory } from '../services/inventoryService.js';
import { Order } from '../models/Order.js';

export const createOrderHandler = async (req, res) => {
  const { items, discountCode } = req.body;
  const timeoutMs = process.env.ORDER_TIMEOUT_MS || 5000;
  
  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'Order must contain at least one item' });
  }

  await reserveInventory(items);
  const newOrder = await Order.create({ items, discountCode });
  res.status(201).json(newOrder);
};

export const getOrderHandler = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
};

export const updateOrderStatusHandler = async (req, res) => {
  const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status });
  res.json(order);
};

export const cancelOrderHandler = async (req, res) => {
  await releaseInventory(req.params.id);
  await Order.findByIdAndDelete(req.params.id);
  res.json({ message: 'Order cancelled successfully' });
};

