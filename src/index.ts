import { TelegramBot } from './telegram/bot';
import { startServer } from './server';
import dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
  console.log('🔧 Loading .env file (local dev)');
  dotenv.config();
} else {
  console.log('☁️ Using environment variables from host');
}

if (!process.env.TG_BOT_TOKEN) {
  console.error('❌ TG_BOT_TOKEN is not set!'); process.exit(1);
}
if (!process.env.ELEVENLABS_API_KEY) {
  console.error('❌ ELEVENLABS_API_KEY is not set!'); process.exit(1);
}

async function main() {
  try {
    const bot = new TelegramBot();
    const isProd = process.env.NODE_ENV === 'production' && !!process.env.APP_BASE_URL;

    await bot.init();

    // 👇 якщо прод + webhook — даємо серверу middleware
    const middleware = isProd ? bot.middleware() : undefined
    await startServer(middleware);

    // якщо локалка — startServer підніметься, а бот уже запустив polling всередині init()
    console.log('✅ Application started successfully');
  } catch (error) {
    console.error('❌ Failed to start application:', error);
    process.exit(1);
  }
}

main();
