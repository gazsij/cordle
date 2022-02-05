import { Chance } from 'chance';

import answers from '../Static/answers.json';
import guesses from '../Static/guesses.json';

import { GuessState, IGuess, IReplyOptions, IServer, IStatistics } from '../Types';
import { ServerRepo, GameRepo } from '../Repositories';
import { Format } from './Format';
import { Game } from '../Models/Game';

export class Words {
	private static readonly Answers: string[] = answers;

	private static readonly Guesses: string[] = guesses;

	private static readonly StartDate: number = new Date(2021, 5, 19).getTime();

	private static readonly Affirmations = ['Genius', 'Magnificent', 'Impressive', 'Splendid', 'Great', 'Phew'];

	public static GetCurrentDay(start?: Date) {
		const today = new Date().setHours(0, 0, 0, 0);
		const beginning = (start?.setHours(0, 0, 0, 0) ?? Words.StartDate);
		const diff = (beginning - today) / (24 * 60 * 60 * 1000);
		return Math.round(Math.abs(diff)) + (start ? 1 : 0);
	}

	public static GetAnswer(day: number, server?: IServer) {
		if (!server)
			return Words.Answers[day];

		return new Chance(`${server.discord_id}-${server.date_joined.getTime()}`).shuffle(Words.Answers)[day];
	}

	public static GetCompletionMessage(game: Game, answer: string) {
		const keyboard = Format.KeyboardEmoji(game.guesses);
		if (game.success)
			return `${Words.Affirmations[game.guesses.length - 1]}! You completed today's word!\n\n${keyboard}`;

		if (game.finished)
			return `Today's word was \`${answer.toUpperCase()}\`.\n\n${keyboard}`;

		return keyboard;
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

	public static ValidateGame(game: Game, word: string, type: string) {
		if (game.finished)
			return { msg: `You have already completed today's ${type} word.`, valid: false };

		if (game.guesses.length >= 6)
			return { msg: `You have already used all guesses for today's ${type} word.`, valid: false };

		if (!word)
			return { msg: 'You did not enter a word.', valid: false };

		if (word.length != 5)
			return { msg: 'Guesses must be 5 letters long.', valid: false };

		if (!Words.Answers.includes(word) && !Words.Guesses.includes(word))
			return { msg: 'Not in word list.', valid: false };

		return { valid: true, msg: '' };
	}

	public static async ShareGame(playerID: string, name: string, serverID?: string): Promise<IReplyOptions> {
		let server;
		if (serverID) {
			server = await ServerRepo.GetServer(serverID);
			if (!server)
				return { msg: 'You have not completed today\'s server word yet.', ephemeral: true };
		}

		const type = server ? 'Server' : 'Global';
		const currentDay = Words.GetCurrentDay(server?.date_joined);
		const game = await GameRepo.GetGame(playerID, currentDay, serverID);

		if (!game || !game.finished)
			return { msg: `You have not completed today's ${type} word yet.`, ephemeral: true };

		const emojis = Format.GuessesToEmoji(game.guesses);

		return { msg: `${name}'s Results\n${type} Word ${currentDay} ${game.guesses.length}/6\n\n${emojis}` };
	}

	public static async GetStatistics(playerID: string, serverID?: string): Promise<IStatistics | undefined> {
		const games = await GameRepo.GetGames(playerID, serverID);

		if (!games)
			return;

		const finished = games.filter(game => game.finished);

		if (finished.length == 0)
			return;

		let server;
		if (serverID)
			server = await ServerRepo.GetServer(serverID);

		const currentDay = Words.GetCurrentDay(server?.date_joined);
		const daysPlayed = finished.map(game => game.day);
		const lastPlayed = Math.max(...daysPlayed);
		const lostStreak = currentDay - lastPlayed > 1;

		const streaks = Words.FindStreaks(daysPlayed, currentDay, lostStreak);

		const todaysGame = games.find(game => game.day == currentDay && game.success);

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
				streak--;

			streak = currentDay - streak;
		}

		return {
			currentStreak: streak,
			maxStreak: max
		};
	}
}
