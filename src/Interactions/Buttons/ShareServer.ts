import { GuildMember } from 'discord.js';

import { IButton } from '../../Types';
import { Words, Format } from '../../Helpers';

export default {
	customID: 'share-server',
	execute: async interaction => {
		await interaction.update({ components: [] });

		if (!interaction.inGuild())
			return;

		const member = interaction.member as GuildMember;
		const name = member.nickname ?? interaction.user.tag;
		const reply = await Words.ShareGame(interaction.user.id, name, interaction.guildId);
		await interaction.followUp(Format.Reply(reply));
	}
} as IButton;
