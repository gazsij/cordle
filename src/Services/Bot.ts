import debug from 'debug';
import pEvent from 'p-event';
import { AutocompleteInteraction, ButtonInteraction, Client, Collection, CommandInteraction, ContextMenuInteraction, Intents, Interaction, SelectMenuInteraction } from 'discord.js';

import { Format, Config, CommandBuilder } from '../Helpers';
import { IButton, ICommand, ISelectMenu, IAutocomplete, IContextMenu, HandlerType, IImportable } from '../Types';

const logSystem = debug('cordle:bot:system');
const logEvent = debug('cordle:bot:event');
const logError = debug('cordle:bot:error');
const logWarn = debug('cordle:bot:warn');

export class Bot {
	private static client: Client;

	private static readonly handlers = new Collection<HandlerType, Collection<string, IImportable>>();

	public static async Setup(): Promise<void> {
		logSystem('Starting bot...');

		Bot.client = new Client({
			intents: [Intents.FLAGS.GUILDS]
		});

		for (const type of Object.values(HandlerType))
			Bot.handlers.set(type, await CommandBuilder.ImportFiles(type));

		// handle interactions
		Bot.client.on('interactionCreate', Bot.InteractionHandler);

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

	private static async InteractionHandler(interaction: Interaction): Promise<void> {
		if (interaction.isButton())
			return Bot.ButtonHandler(interaction);

		if (interaction.isSelectMenu())
			return Bot.SelectMenuHandler(interaction);

		if (interaction.isContextMenu())
			return Bot.ContextMenuHandler(interaction);

		if (interaction.isAutocomplete())
			return Bot.AutocompleteHandler(interaction);

		if (interaction.isCommand())
			return Bot.CommandHandler(interaction);
	}

	private static async CommandHandler(interaction: CommandInteraction): Promise<void> {
		try {
			const commands = Bot.handlers.get(HandlerType.Commands);
			if (!commands) throw 'No commands registered.';

			const command = commands.get(interaction.commandName) as ICommand;
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
			return interaction.reply(Format.Reply({ msg: 'An error occured using this command.  Please try again later.', ephemeral: true }));
		}
	}

	private static async ButtonHandler(interaction: ButtonInteraction): Promise<void> {
		try {
			const buttons = Bot.handlers.get(HandlerType.Buttons);
			if (!buttons) throw 'No buttons registered.';

			const button = buttons.get(interaction.customId) as IButton;
			if (!button) throw `Button ${interaction.customId} not found.`;

			return button.execute(interaction);
		}
		catch (error) {
			logError(error);
			return interaction.reply(Format.Reply({ msg: 'An error occured using this button.  Please try again later.', ephemeral: true }));
		}
	}

	private static async SelectMenuHandler(interaction: SelectMenuInteraction): Promise<void> {
		try {
			const selectMenus = Bot.handlers.get(HandlerType.SelectMenus);
			if (!selectMenus) throw 'No selectMenus registered.';

			const selectMenu = selectMenus.get(interaction.customId) as ISelectMenu;
			if (!selectMenu) throw `SelectMenu ${interaction.customId} not found.`;

			return selectMenu.execute(interaction);
		}
		catch (error) {
			logError(error);
			return interaction.reply(Format.Reply({ msg: 'An error occured using this select menu.  Please try again later.', ephemeral: true }));
		}
	}

	private static async AutocompleteHandler(interaction: AutocompleteInteraction): Promise<void> {
		try {
			const focus = interaction.options.getFocused(true);

			const autocompletes = Bot.handlers.get(HandlerType.Autocompletes);
			if (!autocompletes) throw 'No autocompletes registered.';

			const autocomplete = autocompletes.get(focus.name) as IAutocomplete;
			if (!autocomplete) throw `Autocomplete for ${focus} not found.`;

			return autocomplete.execute(interaction);
		}
		catch (error) {
			logError(error);
			return interaction.respond([]);
		}
	}

	private static async ContextMenuHandler(interaction: ContextMenuInteraction): Promise<void> {
		try {
			const contextMenus = Bot.handlers.get(HandlerType.ContextMenus);
			if (!contextMenus) throw 'No contextMenus registered.';

			const contextMenu = contextMenus.get(interaction.commandName) as IContextMenu;
			if (!contextMenu) throw `ContextMenu ${interaction.commandName} not found.`;

			return contextMenu.execute(interaction);
		}
		catch (error) {
			logError(error);
			return interaction.reply(Format.Reply({ msg: 'An error occured using this select menu.  Please try again later.', ephemeral: true }));
		}
	}
}
