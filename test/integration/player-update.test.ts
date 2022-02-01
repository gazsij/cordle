import { assert } from 'chai';

import { Player, discordID } from '../mock';

describe('integration', () => {
	describe('player update', () => {
		const id = discordID();
		it('should create a new suer', async () => {
			const newPlayer = await Player.create({
				discordID: id,
				games: []
			});
			const newGame = {
				day: 1,
				success: false,
				finished: false,
				guesses: [[]]
			};
			newPlayer.games.push(newGame);
			await newPlayer.save();
		});
		it('should find a user by id', async () => {
			const user = await Player.findOne({ discordID: id });
			assert.exists(user);
			assert.equal(user?.discordID, id);
		});
		it('should enforce uppercase constraint', async () => {
			const player = await Player.findOne({ discordID: id });
			player?.games.push({
				day: 2,
				success: false,
				finished: false,
				guesses: [[
					{ letter: 'W', state: 0 }, { letter: 'e', state: 0 }, { letter: 'A', state: 0 }, { letter: 'r', state: 0 }, { letter: 'y', state: 0 }
				]]
			});
			const updated = await player?.save();
			updated?.games.every((game) => {
				game.guesses.every((guess) => {
					guess.every(({ letter, state }) => {
						assert.equal(letter === letter.toUpperCase(), true);
						assert.isNumber(state);
					});
				});
			});
		});
	});
});
