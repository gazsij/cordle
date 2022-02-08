import { GuildMember } from 'discord.js';

import { IButton } from '../../Types';
import { Words, Format } from '../../Helpers';

export default {
	customID: 'share-global',
	execute: async interaction => {
		await interaction.update({ components: [] });

		const member = interaction.member as GuildMember;
		const name = member?.nickname ?? interaction.user.tag;
		const reply = await Words.ShareGame(interaction.user.id, name);
		await interaction.followUp(Format.Reply(reply));
	}
} as IButton;
