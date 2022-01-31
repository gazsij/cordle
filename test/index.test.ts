/* eslint-disable no-undef */
import { assert } from 'chai';
import { Database } from './mock';

before(async () => {
	await Database.Connect();
});

after(async () => {
	await Database.Close();
});

describe('generic test runner', () => {
	it('should be conencted to database', async () => {
		const connected = await Database.IsConnected();
		assert.isTrue(connected);
	});
	it('should be a placeholder', async () => {
		assert.equal(1 + 1, 2);
	});
});
