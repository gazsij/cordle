import path from 'path';
import glob from 'glob';
import debug from 'debug';
import { promisify } from 'util';
import pEvent from 'p-event';
import { Client, Collection, Intents, Interaction } from 'discord.js';

import Format from '../Helpers/Format';
import Config from '../Helpers/Config';
import { IClient, ICommand } from '../Types/Abstract';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/rest/v9';
import { SlashCommandBuilder } from '@discordjs/builders';

const logSystem = debug('cordle:bot:system');
const logEvent = debug('cordle:bot:event');
const logError = debug('cordle:bot:error');
const logWarn = debug('cordle:bot:warn');

export default class Bot {
	private static client: Client;

	public static async Setup(): Promise<void> {
		logSystem('Starting bot...');

		Bot.client = new Client({
			intents: [Intents.FLAGS.GUILDS]
		}) as IClient;
		Bot.client.commands = new Collection<string, ICommand>();
		Bot.client.cooldowns = new Collection<string, Collection<string, number>>();

		const globPromise = promisify(glob);
		const folder = path.resolve(`${__dirname}/../Commands/*{.js,.ts}`);
		const commandFiles = await globPromise(folder);

		for (const file of commandFiles) {
			const command = await import(file) as ICommand;
			Bot.client.commands.set(command.name, command);
		}

		logSystem(`Imported ${Bot.client.commands.size} command(s).`);

		logSystem('Started refreshing application (/) commands.');

		const body = Bot.client.commands.map((command: ICommand) =>
			new SlashCommandBuilder()
				.setName(command.name)
				.setDescription(command.description)
				.toJSON());

		const rest = new REST({ version: '9' }).setToken(process.env.BOT_TOKEN || '');
		await rest.put(Routes.applicationGuildCommands(process.env.BOT_CLIENT_ID || '', process.env.BOT_GUILD_ID || ''), { body });

		await rest.put(Routes.applicationCommands(process.env.BOT_CLIENT_ID || ''), { body });

		logSystem('Successfully reloaded application (/) commands.');

		// handle message and execute commands
		Bot.client.on('interactionCreate', Bot.MessageHandler);

		// => Bot error and warn handler
		Bot.client.on('error', logError);
		Bot.client.on('warn', logWarn);

		// setup promise for when client is ready
		const ready = pEvent(Bot.client, 'ready');

		// => Login
		await Bot.client.login(Config.BOT_TOKEN);

		await ready;

		if (!Bot.client.user)
			return;

		logSystem(`Logged in as ${Bot.client.user.tag}`);
	}

	public static async Close(): Promise<void> {
		Bot.client.destroy();
		logEvent('[Discord Bot] Closed client.');
	}

	private static async MessageHandler(interaction: Interaction): Promise<void> {
		if (!interaction.isCommand()) return;

		try {

			const command = Bot.client.commands.get(interaction.commandName);

			if (!command) return;

			command.execute(interaction);

		} catch (error) {
			logError(error);
			interaction.reply(Format.Reply({ msg: 'An error occured using this command.  Please try again later.', ephemeral: true }));
		}
	}
}