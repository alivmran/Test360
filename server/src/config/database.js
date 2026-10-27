import mongoose from 'mongoose';
import { env } from './env.js';

export const connectDatabase = async () => {
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true,
    });
    console.log(`[Database] MongoDB connected successfully to ${env.MONGO_URI}`);
  } catch (error) {
    console.warn(`[Database] Warning: Could not connect to MongoDB at ${env.MONGO_URI}. Ensure MongoDB daemon is running.`);
  }

  mongoose.connection.on('disconnected', () => {
    console.log('[Database] MongoDB disconnected.');
  });

  mongoose.connection.on('error', (err) => {
    console.error('[Database] MongoDB connection error:', err);
  });
};

export const disconnectDatabase = async () => {
  await mongoose.disconnect();
};
