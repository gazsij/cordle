import { ApplicationCommandOptionType } from 'discord-api-types/v9';

import { PlayerRepo } from '../Repositories/PlayerRepo';
import Format from '../Helpers/Format';
import Words from '../Helpers/Words';
import { ICommand, IReplyOptions } from '../Types/Abstract';
import { MessageButton } from 'discord.js';

export default {
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
		const { game } = await PlayerRepo.GetOrCreateGame(interaction.user.id, currentDay);

		const word = interaction.options.getString('word', true).toLowerCase();
		const validation = Words.ValidateGame(game, word);
		if (validation.valid)
			return interaction.reply(Format.Reply({ msg: validation.msg, ephemeral: true }));

		const answer = Words.GetAnswer(currentDay);
		const guess = Words.CheckGuess(word, answer);

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
} as ICommand;
