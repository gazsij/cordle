import { GameModel } from '../Models';
import type { IGuess } from '../Types/Abstract';
import { GuessState } from '../Types/Constants';
import { PlayerRepo } from './PlayerRepo';
import { ServerRepo } from './ServerRepo';

export class GameRepo {

	public static async GetGame(playerID: string, day: number, serverID?: string) {
		const player = await PlayerRepo.GetPlayer(playerID);
		if (!player)
			return null;

		let server;
		if (serverID) {
			server = await ServerRepo.GetServer(serverID);
			if (!server)
				return null;
		}

		return GameModel.findOne({ player, server, day });
	}

	public static async GetGames(playerID: string, serverID?: string) {
		const player = await PlayerRepo.GetPlayer(playerID);
		if (!player)
			return null;

		const server = serverID && await ServerRepo.GetServer(serverID);
		if (!server) return null;

		return GameModel.find({ player, server });
	}

	public static async GetOrCreateGame(playerID: string, day: number, serverID?: string) {
		const player = await PlayerRepo.GetOrCreatePlayer(playerID);

		const server = serverID && await ServerRepo.GetOrCreatServer(serverID);

		const game = await GameModel.findOne({ player, server, day });
		if (game)
			return {
				player,
				server,
				game
			};

		const newGame = await GameModel.create({
			player,
			server,
			day,
			success: false,
			finished: false,
			guesses: []
		});

		player.games.push(newGame._id);
		const savedPlayer = await player.save();

		let savedServer;
		if (server) {
			server.games.push(newGame._id);
			savedServer = await server.save();
		}

		return {
			player: savedPlayer,
			server: savedServer,
			game: newGame
		};
	}

	public static async AddGuess(playerID: string, day: number, guess: IGuess[], serverID?: string) {
		const { game } = await GameRepo.GetOrCreateGame(playerID, day, serverID);

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
