const demoMode = process.env.DEMO_MODE === 'true';

if (!demoMode && !process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI is required when DEMO_MODE=false.');
}
if (!demoMode && !process.env.GROQ_API_KEY) {
  throw new Error('GROQ_API_KEY is required when DEMO_MODE=false.');
}

export const config = {
  port: Number(process.env.PORT) || 4000,
  demoMode,
  mongoUri: process.env.MONGODB_URI,
  groqApiKey: process.env.GROQ_API_KEY,
  groqModel: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:8081,http://localhost:8085')
    .split(',').map((origin) => origin.trim()).filter(Boolean),
};
