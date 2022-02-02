import answers from '../Static/answers.json';
import guesses from '../Static/guesses.json';

import { IGame, IGuess, IReplyOptions, IStatistics } from '../Types/Abstract';
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
		const result: IGuess[] = [...word].map(c => ({ letter: c, state: GuessState.Absent }));

		for (let i = 0; i < answer.length; i++) {
			const answerLetter = answer.charAt(i);
			const g = result[i];
			if (g.letter == answerLetter) {
				g.state = GuessState.Correct;
				continue;
			}

			const guess = result.find(g => g.letter == answerLetter);
			if (!guess)
				continue;

			if (guess.state != GuessState.Absent)
				continue;

			guess.state = GuessState.Present;
		}

		return result;
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

	public static async GetStatistics(discordID: string): Promise<IStatistics | undefined> {
		const player = await PlayerRepo.GetPlayer(discordID);

		if (!player)
			return;

		const finished = player.games.filter(game => game.finished);

		if (finished.length == 0)
			return;

		const currentDay = Words.GetCurrentDay();
		const daysPlayed = finished.map(game => game.day);
		const lastPlayed = Math.max(...daysPlayed);
		const lostStreak = currentDay - lastPlayed > 1;

		const streaks = Words.FindStreaks(daysPlayed, currentDay, lostStreak);

		const todaysGame = player.games.find(game => game.day == currentDay && game.success);

		const won = finished.filter(game => game.success);

		const distribution = won
			.map(game => game.guesses.length)
			.reduce((acc, e) => acc.set(e, (acc.get(e) || 0) + 1), new Map<number, number>());

		return {
			gamesPlayed: finished.length,
			winPercentage: Math.round((won.length / finished.length) * 100),
			currentStreak: streaks.currentStreak,
			maxStreak: streaks.maxStreak,
			today: todaysGame?.guesses.length,
			guesses: distribution
		};
	}

	private static FindStreaks(daysPlayed: number[], currentDay: number, lostStreak: boolean) {
		let max = 0;
		const S = new Set(daysPlayed);

		// check each possible sequence from
		// the start then update optimal length
		for (let i = 0; i < daysPlayed.length; i++) {

			// if current element is the starting
			// element of a sequence
			if (S.has(daysPlayed[i] - 1))
				continue;

			// Then check for next elements
			// in the sequence
			let j = daysPlayed[i];
			while (S.has(j))
				j++;

			// update optimal length if
			// this length is more
			max = Math.max(max, j - daysPlayed[i]);
		}


		let streak = 0;
		if (!lostStreak) {
			streak = currentDay;
			while (S.has(streak))
				streak++;

			streak -= (currentDay - 1);
		}

		return {
			currentStreak: streak,
			maxStreak: max
		};
	}
}
