import { SlashCommandBooleanOption, SlashCommandBuilder, SlashCommandChannelOption, SlashCommandIntegerOption, SlashCommandMentionableOption, SlashCommandNumberOption, SlashCommandRoleOption, SlashCommandStringOption, SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder, SlashCommandUserOption } from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import { ApplicationCommandOptionType, Routes } from 'discord-api-types/v9';
import { Collection } from 'discord.js';
import { ICommand, ICommandOption, ISubCommandGroup } from '../Types/Builders';
import { Config } from './Config';

type SlashCommandOption = SlashCommandStringOption
	| SlashCommandIntegerOption
	| SlashCommandNumberOption
	| SlashCommandBooleanOption
	| SlashCommandUserOption
	| SlashCommandChannelOption
	| SlashCommandRoleOption
	| SlashCommandMentionableOption;


export class CommandBuilder {

	static AddOptionDetails<T>(option: ICommandOption, builder: SlashCommandOption): T {
		const data = builder
			.setName(option.name)
			.setDescription(option.description)
			.setRequired(option.required) as unknown as T;

		if (!option.choices)
			return data;

		if (data instanceof SlashCommandStringOption)
			option.choices.forEach(choice => data.addChoice(choice.name, choice.value as string));

		if (data instanceof SlashCommandIntegerOption)
			option.choices.forEach(choice => data.addChoice(choice.name, choice.value as number));

		return data;
	}

	static AddOption(builder: SlashCommandBuilder | SlashCommandSubcommandBuilder, option: ICommandOption) {
		switch (option.dataType) {
			case ApplicationCommandOptionType.String:
				builder.addStringOption(o => CommandBuilder.AddOptionDetails(option, o));
				break;
			case ApplicationCommandOptionType.Integer:
				builder.addIntegerOption(o => CommandBuilder.AddOptionDetails(option, o));
				break;
			case ApplicationCommandOptionType.Number:
				builder.addNumberOption(o => CommandBuilder.AddOptionDetails(option, o));
				break;
			case ApplicationCommandOptionType.Boolean:
				builder.addBooleanOption(o => CommandBuilder.AddOptionDetails(option, o));
				break;
			case ApplicationCommandOptionType.User:
				builder.addUserOption(o => CommandBuilder.AddOptionDetails(option, o));
				break;
			case ApplicationCommandOptionType.Channel:
				builder.addChannelOption(o => CommandBuilder.AddOptionDetails(option, o));
				break;
			case ApplicationCommandOptionType.Role:
				builder.addRoleOption(o => CommandBuilder.AddOptionDetails(option, o));
				break;
			case ApplicationCommandOptionType.Mentionable:
				builder.addMentionableOption(o => CommandBuilder.AddOptionDetails(option, o));
				break;
		}
	}

	static AddSubCommand(builder: SlashCommandSubcommandBuilder, command: ICommand) {
		builder
			.setName(command.name)
			.setDescription(command.description);

		if (command.options)
			command.options.forEach(option => CommandBuilder.AddOption(builder, option));

		return builder;
	}

	static AddSubCommandGroup(builder: SlashCommandSubcommandGroupBuilder, group: ISubCommandGroup) {
		builder
			.setName(group.name)
			.setDescription(group.description);

		if (group.subCommands)
			group.subCommands.forEach(command => builder.addSubcommand(sub => CommandBuilder.AddSubCommand(sub, command)));

		return builder;
	}

	static AddCommand(command: ICommand) {
		const builder = new SlashCommandBuilder()
			.setName(command.name)
			.setDescription(command.description);

		if (command.options)
			command.options.forEach(option => CommandBuilder.AddOption(builder, option));

		if (command.subCommands)
			command.subCommands.forEach(command => builder.addSubcommand(sub => CommandBuilder.AddSubCommand(sub, command)));

		if (command.subCommandGroups)
			command.subCommandGroups.forEach(group => builder.addSubcommandGroup(sub => CommandBuilder.AddSubCommandGroup(sub, group)));

		return builder.toJSON();
	}

	static async RegisterCommands(commands: Collection<string, ICommand>) {
		const body = commands.map(command => CommandBuilder.AddCommand(command));

		const rest = new REST({ version: '9' }).setToken(Config.BOT_TOKEN);
		await rest.put(Routes.applicationGuildCommands(Config.BOT_CLIENT_ID, Config.BOT_GUILD_ID), { body });

		await rest.put(Routes.applicationCommands(Config.BOT_CLIENT_ID), { body });
	}
}
