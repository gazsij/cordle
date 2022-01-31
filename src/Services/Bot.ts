import path from 'path';
import glob from 'glob';
import debug from 'debug';
import { promisify } from 'util';
import pEvent from 'p-event';
import { Client, Collection, Intents, Interaction } from 'discord.js';

import Format from '../Helpers/Format';
import { Config } from '../Helpers/Config';
import type { IButton, IButtonExport, ICommand, ICommandExport } from '../Types/Abstract';
import CommandBuilder from '../Helpers/CommandBuilder';

const logSystem = debug('cordle:bot:system');
const logEvent = debug('cordle:bot:event');
const logError = debug('cordle:bot:error');
const logWarn = debug('cordle:bot:warn');

export class Bot {
	private static client: Client;
	static readonly commands = new Collection<string, ICommand>();
	static readonly buttons = new Collection<string, IButton>();

	public static async Setup(): Promise<void> {
		logSystem('Starting bot...');

		Bot.client = new Client({
			intents: [Intents.FLAGS.GUILDS]
		});

		const globPromise = promisify(glob);
		const commandFolder = path.resolve(`${__dirname}/../Commands/*{.js,.ts}`);
		const commandFiles = await globPromise(commandFolder);

		for (const file of commandFiles) {
			const { default: command } = await import(file) as ICommandExport;
			Bot.commands.set(command.name, command);
		}

		logSystem(`Imported ${Bot.commands.size} command(s).`);

		const buttonFolder = path.resolve(`${__dirname}/../Buttons/*{.js,.ts}`);
		const buttonFiles = await globPromise(buttonFolder);

		for (const file of buttonFiles) {
			const { default: button } = await import(file) as IButtonExport;
			Bot.buttons.set(button.customID, button);
		}

		logSystem(`Imported ${Bot.buttons.size} button(s).`);

		logSystem('Started refreshing application (/) commands.');

		await CommandBuilder.RegisterCommands(Bot.commands);

		logSystem('Successfully reloaded application (/) commands.');

		// handle message and execute commands
		Bot.client.on('interactionCreate', Bot.SlashHandler);
		Bot.client.on('interactionCreate', Bot.ButtonHandler);

		// => Bot error and warn handler
		Bot.client.on('error', logError);
		Bot.client.on('warn', logWarn);

		// setup promise for when client is ready
		const ready = await pEvent(Bot.client, 'ready');

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

	private static async SlashHandler(interaction: Interaction): Promise<void> {
		if (!interaction.isCommand()) return;

		try {
			const command = Bot.commands.get(interaction.commandName);

			if (!command) throw `Command ${interaction.commandName} not found.`;

			await command.execute(interaction);
		}
		catch (error) {
			logError(error);
			interaction.reply(Format.Reply({ msg: 'An error occured using this command.  Please try again later.', ephemeral: true }));
		}
	}

	private static async ButtonHandler(interaction: Interaction): Promise<void> {
		if (!interaction.isButton()) return;

		try {
			const button = Bot.buttons.get(interaction.customId);

			if (!button) throw `Button ${interaction.customId} not found.`;

			await button.execute(interaction);
		}
		catch (error) {
			logError(error);
			interaction.reply(Format.Reply({ msg: 'An error occured using this button.  Please try again later.', ephemeral: true }));
		}
	}
}
