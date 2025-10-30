import { session, Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import type { Update } from "telegraf/types";
import { ElevenLabsClient } from "elevenlabs";
import { Context } from 'telegraf';
import { isEqual, isNil } from 'lodash';

interface MyContext <U extends Update = Update> extends Context<U> {
  session: {
    isAuthenticated: boolean
  },
};

export class TelegramBot {
  private bot: Telegraf<MyContext>;
  private elevenlabs: ElevenLabsClient;
  private readonly BOT_PASSWORD?: string;

  constructor() {
    this.bot = new Telegraf<MyContext>(process.env.TG_BOT_TOKEN || '');
    const apiKey = process.env.ELEVENLABS_API_KEY;
    this.BOT_PASSWORD = process.env.BOT_PASSWORD;

    if (!apiKey) {
      throw new Error('ELEVENLABS_API_KEY is not set');
    }

    if (isNil(this.BOT_PASSWORD)) {
      console.warn('⚠️  BOT_PASSWORD not set, using default password. Please set BOT_PASSWORD environment variable!');
    }

    this.elevenlabs = new ElevenLabsClient({ apiKey });

    this.init();
  }

  private async init() {
    try {
      this.bot.use(session({ defaultSession: () => ({ isAuthenticated: false }) }));

      this.bot.start((ctx) => {
        ctx.session.isAuthenticated = false;
        return ctx.reply('🔐 Welcome! Please enter the password to use this bot.');
      });

      // Authentication middleware
      this.bot.use(async (ctx, next) => {
        // Initialize session if not exists
        if (isNil(ctx.session.isAuthenticated)) {
          ctx.session.isAuthenticated = false;
        }

        // If authenticated, continue
        if (ctx.session.isAuthenticated) {
          return next();
        }

        // Check if message contains password
        if ('text' in ctx.message!) {
          const text = ctx.message.text;
          if (isEqual(text, this.BOT_PASSWORD)) {
            ctx.session.isAuthenticated = true;
            await ctx.reply('✅ Access granted! You can now use the bot. Send me any text and I\'ll convert it to voice.');
            return;
          } else {
            await ctx.reply('❌ Incorrect password. Please try again.');
            return;
          }
        }

        // For non-text messages without authentication
        await ctx.reply('🔐 Please enter the password first.');
      });

      this.initMessageListener();

      console.log('🤖 Launching Telegram bot...');
      await this.bot.launch();
      console.log('✅ Telegram bot started successfully');
    } catch (error) {
      console.error('❌ Failed to launch Telegram bot:', error);
      console.error('Bot will not be available, but server will continue running');
    }
  }

  async initMessageListener() {
    this.bot.on(message('text'), async (ctx) => {
      const userText = ctx.message.text;
      await ctx.sendChatAction('record_voice');
      await this.textToSpeech(userText, ctx);
    });

    this.bot.on(message('caption'), async (ctx) => {
      const userText = ctx.message.caption;
      await ctx.sendChatAction('record_voice');
      await this.textToSpeech(userText, ctx);
    });
  }

  private async textToSpeech(text: string, ctx: MyContext) {
    try {
      const voiceId = "GVRiwBELe0czFUAJj0nX"; // Anton (UA)

      const audio = await this.elevenlabs.textToSpeech.convertAsStream(voiceId, {
        text: text,
        model_id: "eleven_multilingual_v2"
      });

      // Збираємо stream в buffer
      const chunks: Buffer[] = [];
      for await (const chunk of audio) {
        chunks.push(chunk);
      }
      const audioBuffer = Buffer.concat(chunks);
      await ctx.replyWithVoice({ source: audioBuffer });
    } catch (error) {
      console.error('Error:', error);
      await ctx.reply('Помилка генерації 😞');
    }
  }

  async listVoiceWithIds() {
    const voices = await this.elevenlabs.voices.getAll();
    voices.voices.forEach(voice => {
      console.log(`Name: ${voice.name}`);
      console.log(`ID: ${voice.voice_id}`);
      console.log(`Category: ${voice.category}`);
      console.log('---');
    });
  }
}
