import mongoose from 'mongoose';
import { env } from './env.js';

const sanitizeMongoUri = (uri) => {
  if (!uri) return '';
  return uri.replace(/\/\/(.*):(.*)@/, '//$1:***@');
};

export const getDatabaseStatus = () => {
  const readyStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  return {
    status: readyStates[mongoose.connection.readyState] || 'unknown',
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host || null,
    name: mongoose.connection.name || null,
  };
};

export const connectDatabase = async () => {
  const maskedUri = sanitizeMongoUri(env.MONGO_URI);
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true,
    });
    console.log(`[Database] MongoDB connected successfully to ${maskedUri}`);
  } catch (error) {
    console.warn(`[Database] Warning: Could not connect to MongoDB at ${maskedUri}. Ensure MongoDB daemon is running.`);
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
