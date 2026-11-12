import { getConversation, listConversations } from '../services/conversationRepository.js';

export async function getConversations(req, res, next) {
  try {
    const conversations = await listConversations(req.clientHash);
    res.json({ conversations });
  } catch (error) { next(error); }
}

export async function getConversationById(req, res, next) {
  try {
    const conversation = await getConversation(req.clientHash, req.params.conversationId);
    if (!conversation) return res.status(404).json({ error: 'This conversation could not be found.' });
    res.json({ conversation });
  } catch (error) { next(error); }
}
