import { session, Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import { ElevenLabsClient } from "elevenlabs";

export class TelegramBot {
  private bot: Telegraf;
  private elevenlabs: ElevenLabsClient;

  constructor() {
    this.bot = new Telegraf(process.env.TG_BOT_TOKEN || '');
    this.elevenlabs = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY
    });

    this.init();
    // this.listVoiceWithIds();
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

  private async init() {
    this.bot.use(session());
    this.bot.start((ctx) => ctx.reply('Welcome'));
    this.initMessageListener();
    await this.bot.launch();
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

  private async textToSpeech(text: string, ctx: any) {
    try {
      const voiceId = "GVRiwBELe0czFUAJj0nX"; // Anton (UA)

      const audio = await this.elevenlabs.textToSpeech.convertAsStream(voiceId, {
        text: text,
        model_id: "eleven_multilingual_v2" // підтримує українську!
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
}
