import 'dotenv/config';

import { Database, Bot } from './Services';
import { ExitHandler, Config } from './Helpers';

(async () => {
	ExitHandler.Setup();

	Config.Validate();

	await Database.Connect();

	await Bot.Setup();

	ExitHandler.Configure(async () => {
		await Bot.Close();
		await Database.Close();
	});
})();
