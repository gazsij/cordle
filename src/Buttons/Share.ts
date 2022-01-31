import { GuildMember } from 'discord.js';

import { IButton } from '../Types/Abstract';
import Words from '../Helpers/Words';
import Format from '../Helpers/Format';

export default {
	customID: 'share',
	execute: async interaction => {
		const member = interaction.member as GuildMember;
		const name = member?.nickname ?? interaction.user.tag;
		const reply = await Words.ShareGame(interaction.user.id, name);

		return interaction.reply(Format.Reply(reply));
	}
} as IButton;
