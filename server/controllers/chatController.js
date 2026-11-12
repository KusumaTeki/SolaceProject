import { sendTurn } from '../services/chatService.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function postChatMessage(req, res) {
  const { message, conversationId, includeMoodContext, moodContext } = req.body ?? {};
  if (typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Write a message before sending.' });
  }
  const normalizedMessage = message.trim();
  if (normalizedMessage.length > 2000) {
    return res.status(400).json({ error: 'Messages can be up to 2,000 characters.' });
  }
  if (conversationId !== undefined && conversationId !== null && (typeof conversationId !== 'string' || !UUID.test(conversationId))) {
    return res.status(400).json({ error: 'That conversation ID is not valid.' });
  }
  if (includeMoodContext !== undefined && typeof includeMoodContext !== 'boolean') {
    return res.status(400).json({ error: 'Mood context permission must be true or false.' });
  }

  try {
    const result = await sendTurn({
      clientHash: req.clientHash,
      conversationId: conversationId || undefined,
      message: normalizedMessage,
      includeMoodContext,
      moodContext,
    });
    if (result.notFound) return res.status(404).json({ error: 'This conversation could not be found.' });
    res.status(200).json(result);
  } catch (error) {
    console.warn('Chat turn failed:', error?.name || 'UnknownError');
    res.status(503).json({ error: 'The companion is temporarily unavailable. Your message was not saved; please retry.' });
  }
}
