
// Main function
import { TelegramBot } from './telegram/bot';

const main = async () => {
  const telegramBot = new TelegramBot();
};

main().catch(err => console.error(err));