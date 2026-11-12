import { getChatClientId } from '@/features/chat/chatIdentity';
import type { ChatMessage, ConversationSummary, MoodContextItem } from '@/features/chat/types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/+$/, '') ?? '';

export class ChatApiError extends Error {
  constructor(message: string, readonly status?: number) { super(message); this.name = 'ChatApiError'; }
}

async function request<T>(path: string, options: { method?: 'GET' | 'POST'; body?: unknown; withIdentity?: boolean } = {}): Promise<T> {
  if (!API_BASE_URL) throw new ChatApiError('Set EXPO_PUBLIC_API_URL in the project .env file to your computer’s API address.');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const clientId = options.withIdentity ? await getChatClientId() : undefined;
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method ?? 'GET',
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(clientId ? { 'X-Client-ID': clientId } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new ChatApiError(data.error || 'The companion is unavailable. Please try again.', response.status);
    return data as T;
  } catch (error) {
    if (error instanceof ChatApiError) throw error;
    if (error instanceof Error && error.name === 'AbortError') throw new ChatApiError('That took too long. Check the connection and try again.');
    throw new ChatApiError('Could not reach the Solace API. Check the server address and Wi-Fi connection.');
  } finally {
    clearTimeout(timeout);
  }
}

export interface HealthResponse {
  status: 'ok';
  mode: 'demo' | 'production';
  aiProvider: 'demo' | 'groq';
  storage: 'demo-memory' | 'mongodb' | 'unavailable';
  databaseConnected: boolean;
}
export interface ChatTurnResponse {
  conversationId: string;
  userMessage: Omit<ChatMessage, 'id'>;
  assistantMessage: Omit<ChatMessage, 'id'>;
  mode: 'demo' | 'groq' | 'crisis';
  crisis: boolean;
}
export interface ConversationResponse { conversation: { conversationId: string; title: string; messages: Omit<ChatMessage, 'id'>[]; lastMode: string; createdAt: string; updatedAt: string } }

export const getHealth = () => request<HealthResponse>('/health');
export const getConversations = async () => (await request<{ conversations: ConversationSummary[] }>('/conversations', { withIdentity: true })).conversations;
export const getConversation = (id: string) => request<ConversationResponse>(`/conversations/${encodeURIComponent(id)}`, { withIdentity: true });
export const postMessage = (input: { message: string; conversationId?: string; includeMoodContext: boolean; moodContext?: MoodContextItem[] }) =>
  request<ChatTurnResponse>('/chat', { method: 'POST', withIdentity: true, body: input });

export function isApiConfigured() { return Boolean(API_BASE_URL); }
