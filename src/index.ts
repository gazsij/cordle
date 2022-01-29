import 'dotenv/config';

import Bot from './Services/Bot';
import ExitHandler from './Helpers/ExitHandler';
import Config from './Helpers/Config';

(async () => {
	ExitHandler.Setup();

	Config.Validate();

	await Bot.Setup();

	ExitHandler.Configure(async () => {
		await Bot.Close();
	});
})();