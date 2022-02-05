import path from 'path';
import { ColorResolvable } from 'discord.js';

import { Env } from '../Types';

export class Config {
	static readonly NODE_ENV = <Env>process.env.NODE_ENV ?? Env.dev;

	// generic
	static readonly IS_PROD = (process.env.IS_PROD == Env.prod) ? true : false;
	static readonly IS_COMPILED = path.extname(__filename).includes('js');
	static readonly APP_VERSION = process.env.APP_VERSION ?? 'v1';
	static readonly APP_PATCH = process.env.APP_PATCH ?? '0';

	// discord
	static readonly BOT_TOKEN = process.env.BOT_TOKEN as string;
	static readonly BOT_CLIENT_ID = process.env.BOT_CLIENT_ID as string;
	static readonly BOT_GUILD_ID = process.env.BOT_GUILD_ID as string;
	static readonly BOT_PREFIX = process.env.BOT_PREFIX as string ?? '!';
	static readonly BOT_COOLDOWN = parseInt(process.env.BOT_COOLDOWN as string) ?? 3;
	static readonly BOT_COLOR = (process.env.BOT_COLOR as ColorResolvable) ?? '#6A7DBB';
	static readonly BOT_VERSION = `Cordle ${Config.APP_VERSION}.${Config.APP_PATCH}`;
	static readonly BOT_ICON = process.env.BOT_ICON;

	// db
	static readonly DB_CONN = process.env.DB_CONN as string ?? undefined;

	public static Validate(): void {
		if (process.env.BOT_TOKEN === undefined)
			throw new Error('BOT_TOKEN not specified');

		if (process.env.BOT_CLIENT_ID === undefined)
			throw new Error('BOT_CLIENT_ID not specified');

		if (process.env.BOT_GUILD_ID === undefined)
			throw new Error('BOT_GUILD_ID not specified');

		if (process.env.DB_CONN === undefined)
			throw new Error('DB_CONN not specified');
	}
}
