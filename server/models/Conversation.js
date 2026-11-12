import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true, maxlength: 5000 },
  createdAt: { type: Date, required: true, default: Date.now },
}, { _id: false });

const conversationSchema = new mongoose.Schema({
  conversationId: { type: String, required: true },
  clientHash: { type: String, required: true, select: false },
  title: { type: String, required: true, maxlength: 100 },
  messages: { type: [messageSchema], default: [] },
  lastMode: { type: String, enum: ['groq', 'demo', 'crisis'], default: 'groq' },
}, { timestamps: true, versionKey: false });

conversationSchema.index({ clientHash: 1, conversationId: 1 }, { unique: true });
conversationSchema.index({ clientHash: 1, updatedAt: -1 });

export const Conversation = mongoose.model('Conversation', conversationSchema);
