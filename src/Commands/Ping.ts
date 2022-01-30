import Format from '../Helpers/Format';
import { ICommand } from '../Types/Abstract';

export default {
	name: 'ping',
	description: 'Replies with Pong!',
	execute: async interaction => {
		return interaction.reply(Format.Reply({ msg: 'Pong!' }));
	}
} as ICommand;