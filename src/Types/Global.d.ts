import { IButton, ICommand } from './Abstract';

declare module 'discord.js' {
	export interface Client {
		commands: Collection<string, ICommand>
		buttons: Collection<string, IButton>
	}
}