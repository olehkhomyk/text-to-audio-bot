import { session, Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import OpenAI from 'openai';

export class TelegramBot {
  private bot: Telegraf;
  private openai: OpenAI;

  constructor() {
    this.bot = new Telegraf(process.env.TG_BOT_TOKEN || '');
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

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
      // const userText = ctx.message.text;
      // console.log('Received text:', userText);
      // await ctx.reply(`You said: ${userText}`);
      const userText = ctx.message.text;

      // Показуємо що бот "записує голос"
      await ctx.sendChatAction('record_voice');

      try {
        const mp3 = await this.openai.audio.speech.create({
          model: "tts-1", // або "tts-1-hd" для кращої якості (+дорожче)
          voice: "alloy", // alloy, echo, fable, onyx, nova, shimmer
          input: userText,
        });

        const buffer = Buffer.from(await mp3.arrayBuffer());

        await ctx.replyWithVoice({ source: buffer });
      } catch (error: any) {
        console.error('Error generating speech:', error);
        await ctx.reply(`Помилка: ${error.message || 'Не вдалось згенерувати аудіо'}`);
      }
    });
  }
}
