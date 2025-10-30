import { session, Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import type { Update } from "telegraf/types";
import { ElevenLabsClient } from "elevenlabs";
import { Context } from 'telegraf';
import { isNil } from 'lodash';

interface MyContext <U extends Update = Update> extends Context<U> {
  session: {
    isAuthenticated: boolean
  },
}

export class TelegramBot {
  private bot: Telegraf<MyContext>;
  private elevenlabs: ElevenLabsClient;
  private readonly BOT_PASSWORD?: string;
  private _mw?: any;

  middleware() {
    return this._mw;
  }

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
  }

  public async init() {
    try {
      this.bot.use(session({ defaultSession: () => ({ isAuthenticated: false }) }));

      this.bot.start((ctx) => {
        ctx.session.isAuthenticated = false;
        return ctx.reply('🔐 Welcome! Please enter the password to use this bot.');
      });

      this.bot.use(async (ctx, next) => {
        if (ctx.session?.isAuthenticated) return next();

        const maybeText = ('message' in ctx && (ctx as any).message?.text) || undefined;

        if (maybeText && maybeText === this.BOT_PASSWORD) {
          ctx.session.isAuthenticated = true;
          await ctx.reply('✅ Access granted! Send any text to get voice.');
          return;
        }
        if (maybeText) {
          await ctx.reply('❌ Incorrect password. Try again.');
          return;
        }
        await ctx.reply('🔐 Please enter the password first.');
      });

      this.initMessageListener();

      const isProd = process.env.NODE_ENV === 'production';
      const baseUrl = process.env.APP_BASE_URL;

      if (isProd && baseUrl) {
        // 👇 webhook mode
        this._mw = await this.bot.createWebhook({
          domain: baseUrl,
          path: '/tg-webhook',
          drop_pending_updates: true
        });
        console.log('📩 Webhook set:', `${baseUrl}/tg-webhook`);
      } else {
        // 👇 local polling
        console.log('🤖 Launching Telegram bot (polling)...');
        await this.bot.launch();
        console.log('✅ Telegram bot started successfully');
      }
    } catch (error) {
      console.error('❌ Failed to launch Telegram bot:', error);
      console.error('Bot will not be available, but server will continue running');
    }
  }

  private async initMessageListener() {
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
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          speed: 0.9
        }
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

  private async listVoiceWithIds() {
    const voices = await this.elevenlabs.voices.getAll();
    voices.voices.forEach(voice => {
      console.log(`Name: ${voice.name}`);
      console.log(`ID: ${voice.voice_id}`);
      console.log(`Category: ${voice.category}`);
      console.log('---');
    });
  }
}
