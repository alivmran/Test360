import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Look for .env in server root (two levels up from config), fallback to CWD
const serverEnvPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: serverEnvPath });
dotenv.config(); // fallback to CWD if any

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // MongoDB Configuration
  MONGO_URI: z.string().default('mongodb://127.0.0.1:27017/test360_ai'),
  
  // Redis Configuration for BullMQ
  REDIS_HOST: z.string().default('127.0.0.1'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional().default(''),
  
  // GitHub App Security
  GITHUB_APP_ID: z.string().default('1029384'),
  GITHUB_WEBHOOK_SECRET: z.string().default('test360_super_secret_webhook_key_2026'),
  GITHUB_PRIVATE_KEY: z.string().optional().default(''),
  
  // Ollama SLM Inference Service
  OLLAMA_BASE_URL: z.string().default('http://127.0.0.1:11434'),
  SLM_MODEL_NAME: z.string().default('test360-coder:1.5b-qlora-4bit'),
  
  // Docker Sandbox Hardening Limits
  DOCKER_MEMORY_LIMIT: z.string().default('1.5g'),
  DOCKER_CPU_LIMIT: z.string().default('1.0'),
  DOCKER_USER: z.string().default('node'),
  SANDBOX_TIMEOUT_MS: z.coerce.number().default(120000),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables configuration:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
