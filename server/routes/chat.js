import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { postChatMessage } from '../controllers/chatController.js';
import { requireClientId } from '../middleware/requireClientId.js';

const router = Router();
const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'There have been a lot of messages in a short time. Please try again in a little while.' },
});

router.post('/', requireClientId, chatLimiter, postChatMessage);
export default router;
