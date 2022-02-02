import { GameModel } from '../Models';
import type { IGuess } from '../Types/Abstract';
import { GuessState } from '../Types/Constants';
import { PlayerRepo } from './PlayerRepo';

export class GameRepo {

	public static async GetGame(discordID: string, day: number) {
		const player = await PlayerRepo.GetPlayer(discordID);
		if (!player)
			return null;

		return GameModel.findOne({ player, day });
	}

	public static async GetGames(discordID: string) {
		const player = await PlayerRepo.GetPlayer(discordID);
		if (!player)
			return null;

		return GameModel.find({ player });
	}

	public static async GetOrCreateGame(discordID: string, day: number) {
		const player = await PlayerRepo.GetOrCreatePlayer(discordID);

		const game = await GameModel.findOne({ player, day });
		if (game)
			return {
				player,
				game
			};

		const newGame = await GameModel.create({
			player,
			day,
			success: false,
			finished: false,
			guesses: []
		});

		player.games.push(newGame._id);
		const savedPlayer = await player.save();

		return {
			player: savedPlayer,
			game: newGame
		};
	}

	public static async AddGuess(discordID: string, day: number, guess: IGuess[]) {
		const { game } = await GameRepo.GetOrCreateGame(discordID, day);

		game.guesses.push(guess);

		if (game.guesses.length >= 6)
			game.finished = true;

		if (!guess.some(g => g.state == GuessState.Absent || g.state == GuessState.Present)) {
			game.finished = true;
			game.success = true;
		}

		return game.save();
	}
}
