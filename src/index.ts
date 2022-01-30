import 'dotenv/config';

import { Database } from './Services/Database';
import { Bot } from './Services/Bot';
import { ExitHandler } from './Helpers/ExitHandler';
import { Config } from './Helpers/Config';

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
