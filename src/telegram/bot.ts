import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';

export enum MenuItemEnum {
  SAY_HELLO = 'say_hello',
}

export const BOT_MENU: IMenuItem[][] = [
  [
    { text: 'Generate Wallets', callback_data: MenuItemEnum.SAY_HELLO },
  ]
]

export interface IMenuItem {
  text: string;
  callback_data: MenuItemEnum;
}

export class TelegramBot {
  private bot: Telegraf;

  get mainMenu(): { parse_mode: string, reply_markup: { inline_keyboard: IMenuItem[][] } } {
    return { parse_mode: 'MarkdownV2', reply_markup: { inline_keyboard: BOT_MENU } };
  }

  constructor() {
    this.bot = new Telegraf(process.env.TG_BOT_TOKEN || '');
    this.initializeBot();
  }

  private initializeBot(): void {
    this.bot.start((ctx) =>
      ctx.reply('Welcome')
    );

    this.bot.help((ctx) => ctx.reply('Send me a sticker'))
    this.bot.on(message('sticker'), (ctx) => ctx.reply('👍'))
    this.bot.hears('hi', (ctx) => ctx.reply('Hey there'))
    this.bot.launch()
  }
}
