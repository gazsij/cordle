import path from 'path';
import glob from 'glob';
import debug from 'debug';
import { promisify } from 'util';
import pEvent from 'p-event';
import { Client, Collection, Intents, Interaction } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { ApplicationCommandOptionType } from 'discord-api-types/v9';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/rest/v9';

import Format from '../Helpers/Format';
import Config from '../Helpers/Config';
import { IButton, IClient, ICommand } from '../Types/Abstract';

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
		Bot.client.buttons = new Collection<string, IButton>();

		const globPromise = promisify(glob);
		const commandFolder = path.resolve(`${__dirname}/../Commands/*{.js,.ts}`);
		const commandFiles = await globPromise(commandFolder);

		for (const file of commandFiles) {
			const command = await import(file) as ICommand;
			Bot.client.commands.set(command.name, command);
		}

		logSystem(`Imported ${Bot.client.commands.size} command(s).`);

		const buttonFolder = path.resolve(`${__dirname}/../Buttons/*{.js,.ts}`);
		const buttonFiles = await globPromise(buttonFolder);

		for (const file of buttonFiles) {
			const button = await import(file) as IButton;
			Bot.client.buttons.set(button.customID, button);
		}

		logSystem(`Imported ${Bot.client.buttons.size} button(s).`);

		logSystem('Started refreshing application (/) commands.');

		const body = Bot.client.commands.map((command: ICommand) => {
			const builder = new SlashCommandBuilder()
				.setName(command.name)
				.setDescription(command.description);

			if (command.options) {
				command.options.forEach(option => {
					switch (option.dataType) {
						case ApplicationCommandOptionType.String:
							builder.addStringOption(o => o.setName(option.name).setDescription(option.description).setRequired(option.required));
							break;
						case ApplicationCommandOptionType.Integer:
							builder.addIntegerOption(o => o.setName(option.name).setDescription(option.description).setRequired(option.required));
							break;
						case ApplicationCommandOptionType.Number:
							builder.addNumberOption(o => o.setName(option.name).setDescription(option.description).setRequired(option.required));
							break;
						case ApplicationCommandOptionType.Boolean:
							builder.addBooleanOption(o => o.setName(option.name).setDescription(option.description).setRequired(option.required));
							break;
						case ApplicationCommandOptionType.User:
							builder.addUserOption(o => o.setName(option.name).setDescription(option.description).setRequired(option.required));
							break;
						case ApplicationCommandOptionType.Channel:
							builder.addChannelOption(o => o.setName(option.name).setDescription(option.description).setRequired(option.required));
							break;
						case ApplicationCommandOptionType.Role:
							builder.addRoleOption(o => o.setName(option.name).setDescription(option.description).setRequired(option.required));
							break;
						case ApplicationCommandOptionType.Mentionable:
							builder.addMentionableOption(o => o.setName(option.name).setDescription(option.description).setRequired(option.required));
							break;
					}
				});
			}

			return builder.toJSON();
		});

		const rest = new REST({ version: '9' }).setToken(process.env.BOT_TOKEN || '');
		await rest.put(Routes.applicationGuildCommands(process.env.BOT_CLIENT_ID || '', process.env.BOT_GUILD_ID || ''), { body });

		await rest.put(Routes.applicationCommands(process.env.BOT_CLIENT_ID || ''), { body });

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
			const command = Bot.client.commands.get(interaction.commandName);

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
			const button = Bot.client.buttons.get(interaction.customId);

			if (!button) throw `Button ${interaction.customId} not found.`;

			await button.execute(interaction);
		}
		catch (error) {
			logError(error);
			interaction.reply(Format.Reply({ msg: 'An error occured using this button.  Please try again later.', ephemeral: true }));
		}
	}
}