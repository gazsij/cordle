import { ApplicationCommandOptionType } from 'discord-api-types/v9';

import PlayerRepo from '../Repositories/PlayerRepo';
import Format from '../Helpers/Format';
import Words from '../Helpers/Words';
import { ICommand, IGuess, IReplyOptions } from '../Types/Abstract';
import { GuessState } from '../Types/Constants';
import { MessageButton } from 'discord.js';

const command: ICommand = {
	name: 'guess',
	description: 'Submit a guess for the current word.',
	options: [
		{
			name: 'word',
			description: 'Word to guess.',
			dataType: ApplicationCommandOptionType.String,
			required: true
		}
	],
	execute: async interaction => {
		const currentDay = Words.CurrentDay;
		const player = await PlayerRepo.GetOrCreatePlayer(interaction.user.id);
		const game = await PlayerRepo.GetOrCreateGame(player, currentDay);

		if (game.finished)
			return interaction.reply(Format.Reply({ msg: 'You have already completed today\'s word.', ephemeral: true }));

		if (game.guesses.length >= 6)
			return interaction.reply(Format.Reply({ msg: 'You have already used all guesses for today\'s word.', ephemeral: true }));

		const word = interaction.options.getString('word')?.toLowerCase();
		if (!word)
			return interaction.reply(Format.Reply({ msg: 'You did not enter a word.', ephemeral: true }));

		if (word.length != 5)
			return interaction.reply(Format.Reply({ msg: 'Guesses must be 5 letters long.', ephemeral: true }));

		if (!Words.ValidGuess(word))
			return interaction.reply(Format.Reply({ msg: 'Not in word list.', ephemeral: true }));

		const answer = Words.GetAnswer(currentDay);

		const guess: IGuess[] = [];
		for (let c = 0; c < word.length; c++) {
			const w = word.charAt(c);
			const a = answer.charAt(c);
			guess.push({
				letter: w,
				state: w == a ? GuessState.Correct : answer.includes(w) ? GuessState.Present : GuessState.Absent
			});
		}

		const updatedGame = await PlayerRepo.AddGuess(interaction.user.id, currentDay, guess);

		const img = Format.GuessesToImage(updatedGame.guesses);

		const footer = updatedGame.success ?
			'Congratulations on completing today\'s word!' :
			updatedGame.finished ?
				`Today's word was \`${answer.toUpperCase()}\`.` :
				'';

		const replyOptions: IReplyOptions = {
			msg: `Word ${currentDay} ${updatedGame.guesses.length}/6\n\n${footer}`,
			attachment: img,
			button: undefined,
			ephemeral: true
		};

		if (updatedGame.finished)
			replyOptions.button = new MessageButton()
				.setLabel('Share')
				.setStyle('PRIMARY')
				.setCustomId('share');

		return interaction.reply(Format.Reply(replyOptions));
	}
};

export = command;
