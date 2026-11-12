import { config } from '../config/env.js';
import { containsCrisisSignal, crisisReply } from './crisisSafety.js';
import { generateReply } from './groqService.js';
import { appendTurn, getConversation } from './conversationRepository.js';

const DEMO_REPLY = "Thanks for sharing that with me. I can listen and help you find a small next step. What feels most important to talk through right now?";
const ALLOWED_EMOTIONS = new Set(['Joyful', 'Calm', 'Okay', 'Anxious', 'Low', 'Overwhelmed']);

function validateMoodContext(value) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 7).flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const { date, emotion, intensity } = item;
    if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return [];
    if (!ALLOWED_EMOTIONS.has(emotion) || !Number.isInteger(intensity) || intensity < 1 || intensity > 10) return [];
    return [{ date, emotion, intensity }];
  });
}

export async function sendTurn({ clientHash, conversationId, message, includeMoodContext, moodContext }) {
  let prior = null;
  if (conversationId) {
    prior = await getConversation(clientHash, conversationId);
    if (!prior) return { notFound: true };
  }

  const isCrisis = containsCrisisSignal(message);
  const mode = isCrisis ? 'crisis' : config.demoMode ? 'demo' : 'groq';
  let reply = isCrisis ? crisisReply : DEMO_REPLY;

  if (!isCrisis && !config.demoMode) {
    const history = (prior?.messages ?? []).slice(-16).map(({ role, content }) => ({ role, content }));
    const optedInContext = includeMoodContext === true ? validateMoodContext(moodContext) : [];
    reply = await generateReply({ history, userMessage: message, moodContext: optedInContext });
  }

  const conversation = await appendTurn({
    clientHash,
    conversationId,
    userMessage: message,
    assistantMessage: reply,
    mode,
  });
  if (!conversation) return { notFound: true };

  return {
    conversationId: conversation.conversationId,
    userMessage: conversation.messages.at(-2),
    assistantMessage: conversation.messages.at(-1),
    mode,
    crisis: isCrisis,
  };
}
