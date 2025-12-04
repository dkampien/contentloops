import 'dotenv/config';

interface EnvConfig {
  OPENAI_API_KEY: string;
  REPLICATE_API_TOKEN: string;
  BIBLE_API_KEY: string;
}

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function loadEnv(): EnvConfig {
  return {
    OPENAI_API_KEY: getRequiredEnv('OPENAI_API_KEY'),
    REPLICATE_API_TOKEN: getRequiredEnv('REPLICATE_API_TOKEN'),
    BIBLE_API_KEY: getRequiredEnv('BIBLE_API_KEY'),
  };
}

// Lazy-loaded singleton
let envConfig: EnvConfig | null = null;

export function getEnv(): EnvConfig {
  if (!envConfig) {
    envConfig = loadEnv();
  }
  return envConfig;
}
