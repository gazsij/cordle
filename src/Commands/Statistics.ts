import { GuildMember, CommandInteraction } from 'discord.js';
import { ApplicationCommandOptionType } from 'discord-api-types/payloads/v9';

import { Format } from '../Helpers/Format';
import { ICommand } from '../Types/Builders';
import { Words } from '../Helpers/Words';

const execute = async (interaction: CommandInteraction, discordID: string, name: string) => {
	const stats = await Words.GetStatistics(discordID);

	if (!stats)
		return interaction.reply(Format.Reply({ msg: `Statistics are not available for ${name}.`, ephemeral: true }));

	const embed = Format.Embed(name);
	const img = Format.StatisticsToImage(stats);

	const today = new Date(Date.now()).toISOString().split('T')[0];
	return interaction.reply(Format.Reply({ msg: `${today}`, embed, attachment: img }));
};

export default {
	name: 'statistics',
	description: 'View current statistics for a player.',
	subCommands: [
		{
			name: 'self',
			description: 'View your own statistics.',
			execute: async interaction => {
				const member = interaction.member as GuildMember;
				const name = member?.nickname ?? interaction.user.tag;

				return execute(interaction, interaction.user.id, name);
			}
		},
		{
			name: 'other',
			description: 'View another player\' statistics',
			options: [
				{
					name: 'player',
					description: 'Player to view statistics for',
					dataType: ApplicationCommandOptionType.User,
					required: true
				}
			],
			execute: async interaction => {
				const user = interaction.options.getUser('player', true);
				const member = interaction.options.getMember('player') as GuildMember;
				const name = member?.nickname ?? user.tag;

				return execute(interaction, user.id, name);
			}
		}
	]
} as ICommand;
