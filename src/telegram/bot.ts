import { session, Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import console from 'console';

export class TelegramBot {
  private bot: Telegraf;

  constructor() {
    this.bot = new Telegraf(process.env.TG_BOT_TOKEN || '');

    this.init();
  }

  private async init() {
    this.bot.use(session());
    this.bot.start((ctx) => ctx.reply('Welcome'));
    this.initMessageListener();
    await this.bot.launch();
  }

  initMessageListener(): void {
    this.bot.on(message('text'), async (ctx) => {
      const userText = ctx.message.text;
      console.log('Received text:', userText);
      await ctx.reply(`You said: ${userText}`);
    });
  }
}
