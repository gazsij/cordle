import { assert } from 'chai';

import { Database } from '../mock';

describe('integration', () => {
	describe('database', () => {
		it('should be conencted to database', async () => {
			const connected = Database.IsConnected();
			assert.isTrue(connected);
		});
	});
});
