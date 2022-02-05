import path from 'path';
import glob from 'glob';
import debug from 'debug';
import { promisify } from 'util';
import pEvent from 'p-event';
import { Client, Collection, Intents, Interaction } from 'discord.js';

import { Format, Config, CommandBuilder } from '../Helpers';
import { IButton, IButtonExport, ICommand, ICommandExport } from '../Types';

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

	private static async SlashHandler(interaction: Interaction): Promise<void> {
		if (!interaction.isCommand()) return;

		try {
			const command = Bot.commands.get(interaction.commandName);

			if (!command) throw `Command ${interaction.commandName} not found.`;

			if (command.subCommands) {
				const subCommandName = interaction.options.getSubcommand(false);

				const subCommand = command.subCommands.find(sub => sub.name == subCommandName);

				if (!subCommand) throw `Sub command ${subCommandName} not found.`;

				return subCommand.execute(interaction);
			}

			if (command.subCommandGroups) {
				const groupName = interaction.options.getSubcommandGroup(false);

				const group = command.subCommandGroups.find(sub => sub.name == groupName);

				if (!group) throw `Group ${groupName} not found.`;

				if (!group.subCommands) throw `No sub commands registered for ${groupName}.`;

				const subCommandName = interaction.options.getSubcommand(false);

				const subCommand = group.subCommands.find(sub => sub.name == subCommandName);

				if (!subCommand) throw `Sub command ${interaction.commandName} not found in group ${groupName}.`;

				return subCommand.execute(interaction);
			}

			return command.execute(interaction);
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

			return button.execute(interaction);
		}
		catch (error) {
			logError(error);
			interaction.reply(Format.Reply({ msg: 'An error occured using this button.  Please try again later.', ephemeral: true }));
		}
	}
}
