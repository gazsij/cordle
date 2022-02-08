import { ApplicationCommandType } from 'discord-api-types/payloads/v9';

import { Format, Words } from '../../Helpers';
import { IContextMenu } from '../../Types';

export default {
	customID: 'Server Statistics',
	type: ApplicationCommandType.User,
	execute: async interaction => {
		if (!interaction.inGuild())
			return interaction.reply(Format.Reply({ msg: 'Please use this command in a server.', ephemeral: true }));

		const guild = await interaction.client.guilds.fetch(interaction.guildId);
		const member = await guild.members.fetch(interaction.targetId);
		const name = member?.nickname ?? member.user.tag;

		const stats = await Words.GetStatistics(interaction.targetId, interaction.guildId);
		if (!stats)
			return interaction.reply(Format.Reply({ msg: `Server statistics are not available for ${name}.`, ephemeral: true }));

		const embed = Format.Embed(name);
		const img = Format.StatisticsToImage(stats);

		const today = new Date(Date.now()).toISOString().split('T')[0];
		return interaction.reply(Format.Reply({ msg: `${today} Server`, embed, attachment: img }));
	}
} as IContextMenu;
