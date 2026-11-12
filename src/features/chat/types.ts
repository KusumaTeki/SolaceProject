export type ChatRole = 'user' | 'assistant';
export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
  crisis?: boolean;
}
export interface ConversationSummary {
  conversationId: string;
  title: string;
  updatedAt: string;
}
export interface MoodContextItem {
  date: string;
  emotion: string;
  intensity: number;
}
export type ServerMode = 'demo' | 'production' | 'offline';
