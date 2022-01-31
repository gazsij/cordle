import answers from '../Static/answers.json';
import guesses from '../Static/guesses.json';
import { IGame, IGuess, IReplyOptions } from '../Types/Abstract';
import { GuessState } from '../Types/Constants';
import { PlayerRepo } from '../Repositories/PlayerRepo';
import { Format } from './Format';

export class Words {
	private static readonly Answers: string[] = answers;

	private static readonly Guesses: string[] = guesses;

	private static readonly StartDate: number = new Date(2021, 5, 19).getTime();

	public static GetCurrentDay(): number {
		const today = new Date().setHours(0, 0, 0, 0);
		const diff = (Words.StartDate - today) / (24 * 60 * 60 * 1000);
		return Math.round(Math.abs(diff));
	}

	public static GetAnswer(day: number): string {
		return Words.Answers[day];
	}

	public static CheckGuess(word: string, answer: string): IGuess[] {
		const guess: IGuess[] = [];
		for (let c = 0; c < word.length; c++) {
			const w = word.charAt(c);
			const a = answer.charAt(c);
			guess.push({
				letter: w,
				state: w == a ? GuessState.Correct : answer.includes(w) ? GuessState.Present : GuessState.Absent
			});
		}

		return guess;
	}

	public static ValidateGame(game: IGame, word: string) {
		if (game.finished)
			return { msg: 'You have already completed today\'s word.', valid: false };

		if (game.guesses.length >= 6)
			return { msg: 'You have already used all guesses for today\'s word.', valid: false };

		if (!word)
			return { msg: 'You did not enter a word.', valid: false };

		if (word.length != 5)
			return { msg: 'Guesses must be 5 letters long.', valid: false };

		if (!Words.Answers.includes(word) && !Words.Guesses.includes(word))
			return { msg: 'Not in word list.', valid: false };

		return { valid: true, msg: '' };
	}

	public static async ShareGame(discordID: string, name: string): Promise<IReplyOptions> {
		const currentDay = Words.GetCurrentDay();
		const { game } = await PlayerRepo.GetOrCreateGame(discordID, currentDay);

		if (!game.finished)
			return { msg: 'You have not completed today\'s word yet.', ephemeral: true };

		const emojis = Format.GuessesToEmoji(game.guesses);

		return { msg: `${name}'s Results\n Word ${currentDay} ${game.guesses.length}/6\n\n${emojis}` };
	}
}
