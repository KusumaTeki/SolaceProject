import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/env.js';
import { connectDatabase } from './config/database.js';
import healthRoutes from './routes/health.js';
import chatRoutes from './routes/chat.js';
import conversationRoutes from './routes/conversations.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const app = express();
const allowedOrigins = new Set(config.corsOrigins);

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has('*') || allowedOrigins.has(origin)) return callback(null, true);
    return callback(new Error('Origin is not allowed by CORS'));
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'X-Client-ID'],
  credentials: false,
}));
app.use(express.json({ limit: '16kb' }));
app.get('/', (_req, res) => res.json({ name: 'Solace API', health: '/api/health' }));
app.use('/api/health', healthRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/conversations', conversationRoutes);
app.use(notFound);
app.use(errorHandler);

await connectDatabase();
const server = app.listen(config.port, '0.0.0.0', () => {
  console.log(`Solace API listening on port ${config.port} (${config.demoMode ? 'DEMO MODE' : 'Groq + MongoDB'})`);
});

async function shutdown(signal) {
  console.log(`${signal}: closing Solace API`);
  server.close(async () => {
    const mongoose = await import('mongoose');
    if (mongoose.default.connection.readyState !== 0) await mongoose.default.disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
