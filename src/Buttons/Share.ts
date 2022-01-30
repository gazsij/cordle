import PlayerRepo from '../Repositories/PlayerRepo';
import Format from '../Helpers/Format';
import { IButton } from '../Types/Abstract';
import Words from '../Helpers/Words';

export default {
	customID: 'share',
	execute: async interaction => {
		const currentDay = Words.CurrentDay;
		const { game } = await PlayerRepo.GetOrCreateGame(interaction.user.id, currentDay);

		if (!game.finished)
			return interaction.reply(Format.Reply({ msg: 'You have not completed today\'s word yet.', ephemeral: true }));

		const emojis = Format.GuessesToEmoji(game.guesses);

		return interaction.reply(Format.Reply({ msg: `Word ${currentDay} ${game.guesses.length}/6\n\n${emojis}\n` }));
	}
} as IButton;
