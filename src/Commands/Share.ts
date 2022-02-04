import { CommandInteraction, GuildMember } from 'discord.js';

import { Words } from '../Helpers/Words';
import { Format } from '../Helpers/Format';
import { ICommand } from '../Types/Builders';

const execute = async (interaction: CommandInteraction, serverID?: string) => {
	const member = interaction.member as GuildMember;
	const name = member?.nickname ?? interaction.user.tag;
	const reply = await Words.ShareGame(interaction.user.id, name, serverID);

	return interaction.reply(Format.Reply(reply));
};

export default {
	name: 'share',
	description: 'Shares your result of today\'s word.',
	subCommands: [
		{
			name: 'global',
			description: 'Shares your result of today\'s global word.',
			execute: interaction => execute(interaction)
		},
		{
			name: 'server',
			description: 'Shares your result of today\'s server word.',
			execute: interaction => {
				if (!interaction.inGuild())
					return interaction.reply(Format.Reply({ msg: 'Please use this command in a server.' }));

				return execute(interaction, interaction.guildId);
			}
		}
	]
} as ICommand;
