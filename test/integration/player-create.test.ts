import { assert } from 'chai';

import { PlayerModel as Player, discordID } from '../mock';

describe('integration', () => {
	describe('player create', () => {
		const id = discordID();
		it('should create a new user', async () => {
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
		it('should create many unique user ids', async () => {
			const documents = await Promise.all(
				Array.from({ length: 500 }).map(async () => {
					return Player.create({
						discordID: discordID(),
						games: []
					});
				})
			);
			assert.equal(documents.length, 500);
			documents.every((user) => {
				assert.notEqual(user?.discordID, id);
			});
		});
	});
});
