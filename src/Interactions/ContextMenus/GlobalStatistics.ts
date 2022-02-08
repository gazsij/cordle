import { ApplicationCommandType } from 'discord-api-types/payloads/v9';

import { Format, Words } from '../../Helpers';
import { IContextMenu } from '../../Types';

export default {
	customID: 'Global Statistics',
	type: ApplicationCommandType.User,
	execute: async interaction => {

		const user = await interaction.client.users.fetch(interaction.targetId);

		const guild = interaction.guildId && await interaction.client.guilds.fetch(interaction.guildId);
		const member = guild && await guild.members.fetch(interaction.targetId);
		const name = (member && member?.nickname) ?? user.tag;

		const stats = await Words.GetStatistics(interaction.targetId);
		if (!stats)
			return interaction.reply(Format.Reply({ msg: `Global statistics are not available for ${name}.`, ephemeral: true }));

		const embed = Format.Embed(name);
		const img = Format.StatisticsToImage(stats);

		const today = new Date(Date.now()).toISOString().split('T')[0];
		return interaction.reply(Format.Reply({ msg: `${today} Global`, embed, attachment: img }));
	}
} as IContextMenu;
