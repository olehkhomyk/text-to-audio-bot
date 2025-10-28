import { TelegramBot } from './telegram/bot';
import { startServer } from './server';
import dotenv from 'dotenv';

// Завантажуємо .env тільки локально
if (process.env.NODE_ENV !== 'production') {
  console.log('🔧 Loading .env file (local development)');
  dotenv.config();
} else {
  console.log('☁️  Using environment variables from Render');
}

// Validate environment variables
if (!process.env.TG_BOT_TOKEN) {
  console.error('❌ TG_BOT_TOKEN is not set!');
  process.exit(1);
}

if (!process.env.ELEVENLABS_API_KEY) {
  console.error('❌ ELEVENLABS_API_KEY is not set!');
  process.exit(1);
}

// Асинхронний запуск
async function main() {
  try {
    // Запускаємо сервер для Render
    await startServer();
    
    // Запускаємо бота
    const bot = new TelegramBot();
    console.log('✅ Application started successfully');
  } catch (error) {
    console.error('❌ Failed to start application:', error);
    process.exit(1);
  }
}

main();

// Graceful shutdown
process.once('SIGINT', () => {
  console.log('Bot stopping...');
  process.exit(0);
});

process.once('SIGTERM', () => {
  console.log('Bot stopping...');
  process.exit(0);
});