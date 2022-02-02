import { GuildMember } from 'discord.js';

import { Words } from '../Helpers/Words';
import { Format } from '../Helpers/Format';
import { ICommand } from '../Types/Builders';

export default {
	name: 'share',
	description: 'Shares your result of today\'s word.',
	execute: async interaction => {
		const member = interaction.member as GuildMember;
		const name = member?.nickname ?? interaction.user.tag;
		const reply = await Words.ShareGame(interaction.user.id, name);

		return interaction.reply(Format.Reply(reply));
	}
} as ICommand;
