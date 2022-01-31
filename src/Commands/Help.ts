import { ApplicationCommandOptionType } from 'discord-api-types/v9';

import { Bot } from '../Services/Bot';
import { Format } from '../Helpers/Format';
import { ICommand } from '../Types/Abstract';

export default {
	name: 'help',
	description: 'List all commands or info about a specific command.',
	options: [
		{
			name: 'command',
			description: 'Command to get information about.',
			dataType: ApplicationCommandOptionType.String,
			required: false
		}
	],
	execute: async interaction => {
		const commandName = interaction.options.getString('command');

		if (!commandName) {
			const embed = Format.Embed('Commands');
			const names = Bot.commands.map(command => command.name);

			embed.addField('** **', names.join('\n'));

			return interaction.reply(Format.Reply({
				msg: 'You can use the optional parameter `command` to get info on a specific command!',
				embed,
				ephemeral: true
			}));
		}

		const command = Bot.commands.get(commandName);
		if (!command)
			return interaction.reply(Format.Reply({ msg: 'That\'s not a valid command name.' }));

		const data = [];

		data.push(`**Name:** ${command.name}`);

		if (command.description) data.push(`**Description:** ${command.description}`);

		return interaction.reply(Format.Reply({ msg: data }));
	}
} as ICommand;
