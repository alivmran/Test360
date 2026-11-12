import { Product } from '../models/Product.js';

export const reserveInventory = async (items) => {
  for (const item of items) {
    const product = await Product.findOne({ sku: item.sku });
    if (!product || product.stockCount < item.quantity) {
      throw new Error(`Insufficient inventory for SKU: ${item.sku}`);
    }
    product.stockCount -= item.quantity;
    await product.save();
  }
};

export const releaseInventory = async (orderId) => {
  return true;
};

