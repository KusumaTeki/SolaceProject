import { Router } from 'express';
import { getConversationById, getConversations } from '../controllers/conversationController.js';
import { requireClientId } from '../middleware/requireClientId.js';

const router = Router();
router.use(requireClientId);
router.get('/', getConversations);
router.get('/:conversationId', getConversationById);
export default router;
