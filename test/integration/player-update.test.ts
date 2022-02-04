import { assert } from 'chai';

import { PlayerModel as Player, GameModel as Game, discordID } from '../mock';

describe('integration', () => {
	describe('player update', () => {
		const id = discordID();
		it('should create a new suer', async () => {
			const newPlayer = await Player.create({
				discordID: id,
				games: []
			});
			await newPlayer.save();
		});
		it('should find a user by id', async () => {
			const user = await Player.findOne({ discordID: id });
			assert.exists(user);
			assert.equal(user?.discordID, id);
		});
		it('should attach a game to a user', async () => {
			const user = await Player.findOne({ discordID: id });
			assert.exists(user);
			assert.equal(user?.discordID, id);
		});
		it('should create many games for a user', async () => {
			const player = await Player.findOne({ discordID: id });
			if (!player) {
				throw new Error('player not found');
			}

			const newGames = await Promise.all(
				Array.from({ length: 20 }).map(async () => {
					return Game.create({
						player,
						day: discordID(), // just need a unique num here
						success: false,
						finished: false,
						guesses: [[
							{ letter: 'W', state: 0 },
							{ letter: 'e', state: 0 },
							{ letter: 'A', state: 0 },
							{ letter: 'r', state: 0 },
							{ letter: 'y', state: 0 }
						]]
					});
				})
			);
			for (const game of newGames) {
				player?.games?.push(game._id);
			}
			const { games } = await (await player.save()).populate('games');
			assert.equal(20, games.length);
		});
	});
});
