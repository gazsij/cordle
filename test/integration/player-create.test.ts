import { assert } from 'chai';

import { Player, discordID } from '../mock';
import type { IPlayer } from '../mock';

describe('integration', () => {
	describe('player create', () => {
		const id = discordID();
		it('should create a new suer', async () => {
			const newPlayer = await Player.create({
				discord_id: id,
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
			const user = await Player.findOne({ discord_id: id });
			assert.exists(user);
			assert.equal(user?.discord_id, id);
		});
		it('should create many unique user ids', async () => {
			const documents: IPlayer[] = await Promise.all(
				Array.from({ length: 500 }).map(async () => {
					return Player.create({
						discord_id: discordID(),
						games: [{
							day: 1,
							success: false,
							finished: false,
							guesses: [[]]
						}]
					});
				})
			);
			assert.equal(documents.length, 500);
			documents.every((user) => {
				assert.notEqual(user?.discord_id, id);
			});
		});
	});
});
