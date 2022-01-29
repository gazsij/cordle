import { ColorResolvable } from 'discord.js';
import path from 'path';

import { Env } from '../Types/Constants';

export default class Config {
	static readonly NODE_ENV = <Env>process.env.NODE_ENV || Env.dev;

	// generic
	static readonly IS_PROD = (process.env.IS_PROD == Env.prod) ? true : false;
	static readonly IS_COMPILED = path.extname(__filename).includes('js');
	static readonly APP_VERSION = process.env.APP_VERSION || 'v1';
	static readonly APP_PATCH = process.env.APP_PATCH || '0';

	// discord
	static readonly BOT_TOKEN = process.env.BOT_TOKEN as string || undefined;
	static readonly BOT_PREFIX = process.env.BOT_PREFIX as string || '!';
	static readonly BOT_COOLDOWN = parseInt(process.env.BOT_COOLDOWN as string) || 3;
	static readonly BOT_COLOR = (process.env.BOT_COLOR as ColorResolvable) || '#6A7DBB';
	static readonly BOT_VERSION = `Cordle ${Config.APP_VERSION}.${Config.APP_PATCH}`;
	static readonly BOT_ICON = process.env.BOT_ICON;

	public static Validate(): void {
		if (Config.BOT_TOKEN === undefined)
			throw new Error('BOT_TOKEN not specified');
	}
}