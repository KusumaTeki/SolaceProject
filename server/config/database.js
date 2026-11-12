import mongoose from 'mongoose';
import { config } from './env.js';

export async function connectDatabase() {
  if (config.demoMode) return false;
  await mongoose.connect(config.mongoUri, {
    serverSelectionTimeoutMS: 10000,
    maxPoolSize: 10,
    autoIndex: true,
  });
  return true;
}

export function databaseIsReady() {
  return mongoose.connection.readyState === 1;
}
