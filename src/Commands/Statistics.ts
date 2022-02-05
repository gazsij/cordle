import { GuildMember, CommandInteraction } from 'discord.js';
import { ApplicationCommandOptionType } from 'discord-api-types/payloads/v9';

import { Format } from '../Helpers/Format';
import { ICommand } from '../Types';
import { Words } from '../Helpers/Words';

const server = async (interaction: CommandInteraction, execute: (interaction: CommandInteraction, serverID?: string) => Promise<void>) => {
	if (!interaction.inGuild())
		return interaction.reply(Format.Reply({ msg: 'Please use this command in a server.' }));

	return execute(interaction, interaction.guildId);
};

const self = async (interaction: CommandInteraction, serverID?: string) => {
	const member = interaction.member as GuildMember;
	const name = member?.nickname ?? interaction.user.tag;

	return execute(interaction, interaction.user.id, name, serverID);
};

const other = async (interaction: CommandInteraction, serverID?: string) => {
	const user = interaction.options.getUser('player', true);
	const member = interaction.options.getMember('player') as GuildMember;
	const name = member?.nickname ?? user.tag;

	return execute(interaction, user.id, name, serverID);
};

const execute = async (interaction: CommandInteraction, playerID: string, name: string, serverID?: string) => {
	const type = serverID ? 'Server' : 'Global';
	const stats = await Words.GetStatistics(playerID, serverID);
	if (!stats)
		return interaction.reply(Format.Reply({ msg: `${type} statistics are not available for ${name}.`, ephemeral: true }));

	const embed = Format.Embed(name);
	const img = Format.StatisticsToImage(stats);

	const today = new Date(Date.now()).toISOString().split('T')[0];
	return interaction.reply(Format.Reply({ msg: `${today} ${type}`, embed, attachment: img }));
};

export default {
	name: 'statistics',
	description: 'View current statistics for a player.',
	subCommandGroups: [
		{
			name: 'global',
			description: 'View current global statistics for a player.',
			subCommands: [
				{
					name: 'self',
					description: 'View your own global statistics.',
					execute: interaction => self(interaction)
				},
				{
					name: 'other',
					description: 'View another player\'s global statistics',
					options: [
						{
							name: 'player',
							description: 'Player to view statistics for',
							dataType: ApplicationCommandOptionType.User,
							required: true
						}
					],
					execute: interaction => other(interaction)
				}
			]
		},
		{
			name: 'server',
			description: 'View current server statistics for a player.',
			subCommands: [
				{
					name: 'self',
					description: 'View your own server statistics.',
					execute: interaction => server(interaction, self)
				},
				{
					name: 'other',
					description: 'View another player\'s server statistics',
					options: [
						{
							name: 'player',
							description: 'Player to view statistics for',
							dataType: ApplicationCommandOptionType.User,
							required: true
						}
					],
					execute: interaction => server(interaction, other)
				}
			]
		}
	]
} as ICommand;
