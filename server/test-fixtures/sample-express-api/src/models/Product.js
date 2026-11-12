import mongoose from 'mongoose';

const { Schema } = mongoose;

const ProductSchema = new Schema(
  {
    sku: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    stockCount: { type: Number, default: 0 },
    category: { type: String, default: 'general' },
  },
  { timestamps: true }
);

export const Product = mongoose.model('Product', ProductSchema);

