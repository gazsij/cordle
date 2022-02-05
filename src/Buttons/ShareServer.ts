import { GuildMember } from 'discord.js';

import { IButton } from '../Types';
import { Words } from '../Helpers/Words';
import { Format } from '../Helpers/Format';

export default {
	customID: 'share-server',
	execute: async interaction => {
		if (interaction.replied)
			return;

		if (!interaction.inGuild())
			return;

		const member = interaction.member as GuildMember;
		const name = member?.nickname ?? interaction.user.tag;
		const reply = await Words.ShareGame(interaction.user.id, name, interaction.guildId);

		return interaction.reply(Format.Reply(reply));
	}
} as IButton;
