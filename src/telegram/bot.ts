import { session, Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import { ElevenLabsClient } from "elevenlabs";
import { Context } from 'telegraf';
import { isNil } from 'lodash';

export class TelegramBot {
  private bot: Telegraf<Context>;
  private elevenlabs: ElevenLabsClient;
  private readonly BOT_PASSWORD?: string;
  private _mw?: any;

  // Persistent storage for authenticated users (survives restarts)
  private authenticatedUsers: Set<number> = new Set();

  // Track users who are currently in password input mode
  private awaitingPassword: Set<number> = new Set();

  middleware() {
    return this._mw;
  }

  constructor() {
    this.bot = new Telegraf<Context>(process.env.TG_BOT_TOKEN || '');
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
      this.bot.use(session());

      // /start command - initiates authentication flow
      this.bot.start(async (ctx) => {
        const userId = ctx.from?.id;
        if (!userId) return;

        // Check if user is already authenticated
        if (this.authenticatedUsers.has(userId)) {
          return ctx.reply('✅ You are already authenticated! Send any text to convert it to voice.\n\nCommands:\n/help - Show available commands\n/auth - Re-authenticate');
        }

        // Start authentication flow
        this.awaitingPassword.add(userId);
        return ctx.reply('🔐 Welcome! Please enter the password to use this bot.');
      });

      // /auth command - allows re-authentication
      this.bot.command('auth', async (ctx) => {
        const userId = ctx.from?.id;
        if (!userId) return;

        // Remove from authenticated users
        this.authenticatedUsers.delete(userId);
        this.awaitingPassword.add(userId);

        return ctx.reply('🔐 Please enter the password to authenticate.');
      });

      // /help command
      this.bot.command('help', async (ctx) => {
        const helpMessage = `
          📖 *Text to Audio Bot Help*
          
          *Available Commands:*
          /start - Start the bot and authenticate
          /auth - Re-authenticate with password
          /help - Show this help message
          
          *How to use:*
          1. Authenticate using /start or /auth
          2. Send any text message or photo with caption
          3. Receive audio voice message
          
          *Note:* After bot restart, you may need to use /auth to re-authenticate.
        `;
        return ctx.reply(helpMessage, { parse_mode: 'Markdown' });
      });

      // Authentication middleware
      this.bot.use(async (ctx, next) => {
        const userId = ctx.from?.id;
        if (!userId) return;

        // Check if user is authenticated
        if (this.authenticatedUsers.has(userId)) {
          return next();
        }

        // If user is awaiting password, check if this message is the password
        const maybeText = ('message' in ctx && (ctx as any).message?.text) || undefined;

        if (this.awaitingPassword.has(userId) && maybeText) {
          // Don't treat commands as password attempts
          if (maybeText.startsWith('/')) {
            return next();
          }

          // Check password
          if (maybeText === this.BOT_PASSWORD) {
            this.authenticatedUsers.add(userId);
            this.awaitingPassword.delete(userId);
            await ctx.reply('✅ Access granted! Send any text to convert it to voice.\n\nUse /help to see available commands.');
            return;
          } else {
            await ctx.reply('❌ Incorrect password. Try again or use /start to restart.');
            return;
          }
        }

        // User is not authenticated and not in password flow
        await ctx.reply('🔐 Please authenticate first using /start or /auth command.');
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

  private async textToSpeech(text: string, ctx: Context) {
    try {
      const voiceId = "GVRiwBELe0czFUAJj0nX"; // Anton (UA)

      const audio = await this.elevenlabs.textToSpeech.convertAsStream(voiceId, {
        text: text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          speed: 0.95
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
