import { Router } from 'express';
import { config } from '../config/env.js';
import { databaseIsReady } from '../config/database.js';
import { isGroqConfigured } from '../services/groqService.js';
import { storageStatus } from '../services/conversationRepository.js';

const router = Router();
router.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    mode: config.demoMode ? 'demo' : 'production',
    aiProvider: isGroqConfigured() && !config.demoMode ? 'groq' : 'demo',
    storage: storageStatus(),
    databaseConnected: config.demoMode ? false : databaseIsReady(),
  });
});
export default router;
