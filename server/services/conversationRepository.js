import { randomUUID } from 'node:crypto';
import { config } from '../config/env.js';
import { databaseIsReady } from '../config/database.js';
import { Conversation } from '../models/Conversation.js';

const demoConversations = new Map();

function publicConversation(document) {
  if (!document) return null;
  const data = typeof document.toObject === 'function' ? document.toObject() : document;
  return {
    conversationId: data.conversationId,
    title: data.title,
    messages: data.messages.map((message) => ({ role: message.role, content: message.content, createdAt: message.createdAt })),
    lastMode: data.lastMode,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export async function listConversations(clientHash) {
  if (config.demoMode) {
    return [...demoConversations.values()].filter((item) => item.clientHash === clientHash)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .map(({ conversationId, title, updatedAt }) => ({ conversationId, title, updatedAt }));
  }
  const documents = await Conversation.find({ clientHash }).sort({ updatedAt: -1 }).limit(50).select('conversationId title updatedAt').lean();
  return documents.map(({ conversationId, title, updatedAt }) => ({ conversationId, title, updatedAt }));
}

export async function getConversation(clientHash, conversationId) {
  if (config.demoMode) {
    const item = demoConversations.get(conversationId);
    return item?.clientHash === clientHash ? publicConversation(item) : null;
  }
  const document = await Conversation.findOne({ clientHash, conversationId });
  return publicConversation(document);
}

export async function appendTurn({ clientHash, conversationId, userMessage, assistantMessage, mode }) {
  const id = conversationId || randomUUID();
  const now = new Date();
  const turn = [
    { role: 'user', content: userMessage, createdAt: now },
    { role: 'assistant', content: assistantMessage, createdAt: now },
  ];

  if (config.demoMode) {
    const existing = demoConversations.get(id);
    if (existing && existing.clientHash !== clientHash) return null;
    const saved = existing
      ? { ...existing, messages: [...existing.messages, ...turn], lastMode: mode, updatedAt: now }
      : { conversationId: id, clientHash, title: userMessage.slice(0, 90), messages: turn, lastMode: mode, createdAt: now, updatedAt: now };
    demoConversations.set(id, saved);
    return publicConversation(saved);
  }

  if (conversationId) {
    const updated = await Conversation.findOneAndUpdate(
      { clientHash, conversationId },
      { $push: { messages: { $each: turn } }, $set: { lastMode: mode } },
      { new: true, runValidators: true },
    );
    return publicConversation(updated);
  }

  const created = await Conversation.create({
    conversationId: id,
    clientHash,
    title: userMessage.slice(0, 90),
    messages: turn,
    lastMode: mode,
  });
  return publicConversation(created);
}

export function storageStatus() {
  return config.demoMode ? 'demo-memory' : databaseIsReady() ? 'mongodb' : 'unavailable';
}
