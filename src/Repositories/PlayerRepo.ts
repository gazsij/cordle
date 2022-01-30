import { Player, IPlayer, IPlayerDoc } from '../Models/Player';
import { IGame, IGuess } from '../Types/Abstract';
import { GuessState } from '../Types/Constants';

export default class PlayerRepo {

	public static async GetPlayer(discordID: string): Promise<IPlayer> {
		return await Player.findOne({ discordID });
	}

	public static async GetOrCreatePlayer(discordID: string): Promise<IPlayerDoc> {
		const player = await Player.findOne({ discordID });
		if (player)
			return player;

		return await Player.create({
			discordID,
			games: []
		});
	}

	public static async GetOrCreateGame(player: IPlayerDoc, day: number): Promise<IGame> {
		const game = player.games.find(game => game.day == day);
		if (game)
			return game;

		const newGame: IGame = {
			day,
			success: false,
			finished: false,
			guesses: []
		};

		player.games.push(newGame);
		await player.save();

		return newGame;
	}

	public static async GetGame(discordID: string, day: number): Promise<IGame> {
		const player = await PlayerRepo.GetOrCreatePlayer(discordID);

		return await PlayerRepo.GetOrCreateGame(player, day);
	}

	public static async AddGuess(discordID: string, day: number, guess: IGuess[]): Promise<IGame> {
		const player = await PlayerRepo.GetOrCreatePlayer(discordID);
		const game = await PlayerRepo.GetOrCreateGame(player, day);

		game.guesses.push(guess);

		if (game.guesses.length >= 6)
			game.finished = true;

		if (!guess.some(g => g.state == GuessState.Absent || g.state == GuessState.Present)) {
			game.finished = true;
			game.success = true;
		}

		await player.save();

		return game;
	}
}