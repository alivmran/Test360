import mongoose from 'mongoose';

const { Schema } = mongoose;

const OrderSchema = new Schema(
  {
    orderNumber: { type: String, required: true },
    customerEmail: { type: String, required: true },
    totalAmount: { type: Number, required: true },
    discountCode: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'paid', 'cancelled'], default: 'pending' },
    items: [
      {
        sku: String,
        quantity: Number,
        price: Number,
      },
    ],
  },
  { timestamps: true }
);

export const Order = mongoose.model('Order', OrderSchema);

