import Format from '../Helpers/Format';
import { ICommand } from '../Types/Abstract';

const command: ICommand = {
	name: 'ping',
	description: 'Replies with Pong!',
	execute: async interaction => {
		await interaction.reply(Format.Reply({ msg: 'Pong!' }));
	}
};

export = command;