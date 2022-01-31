/* eslint-disable no-undef */
import { assert } from 'chai';
import { Database, Player, discordID } from './mock';
import type { IPlayer } from './mock';

before(async () => {
	await Database.Connect();
});

after(async () => {
	await Database.Close();
});

describe('generic test runner', () => {

	const id = discordID();

	it('should be conencted to database', async () => {
		const connected = Database.IsConnected();
		assert.isTrue(connected);
	});
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
	it('should create many unique user ids', async () => {
		let index = 0;
		const ids = [];
		while (index < 100) {
			ids.push(discordID());
			index++;
		}
		const userMap = ids.reduce((acc: Promise<IPlayer>[], id) => {
			acc.push(Player.create({
				discordID: id,
				games: [{
					day: 1,
					success: false,
					finished: false,
					guesses: [[]]
				}]
			}));
			return acc;
		}, []);
		const users = await Promise.all(userMap);
		users.every((user) => {
			assert.notEqual(user?.discordID, id);
		});
	});
	it('should find a user by id', async () => {
		const user = await Player.findOne({ discordID: id });
		assert.exists(user);
		assert.equal(user?.discordID, id);
	});
});
