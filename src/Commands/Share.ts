import Words from '../Helpers/Words';
import PlayerRepo from '../Repositories/PlayerRepo';
import Format from '../Helpers/Format';
import { ICommand } from '../Types/Abstract';

const command: ICommand = {
	name: 'share',
	description: 'Shares your result of today\'s word.',
	execute: async interaction => {
		const currentDay = Words.CurrentDay;
		const player = await PlayerRepo.GetOrCreatePlayer(interaction.user.id);
		const game = await PlayerRepo.GetOrCreateGame(player, currentDay);

		if (!game.finished)
			return interaction.reply(Format.Reply({ msg: 'You have not completed today\'s word yet.', ephemeral: true }));

		const emojis = Format.GuessesToEmoji(game.guesses);

		return interaction.reply(Format.Reply({ msg: `Word ${currentDay} ${game.guesses.length}/6\n\n${emojis}\n` }));
	}
};

export = command;