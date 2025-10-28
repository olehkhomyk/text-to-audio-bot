import { TelegramBot } from './telegram/bot';
import { startServer } from './server';
import dotenv from 'dotenv';

dotenv.config();

// Запускаємо сервер для Render
startServer();

// Запускаємо бота
const bot = new TelegramBot();

// Graceful shutdown
process.once('SIGINT', () => {
  console.log('Bot stopping...');
  process.exit(0);
});

process.once('SIGTERM', () => {
  console.log('Bot stopping...');
  process.exit(0);
});