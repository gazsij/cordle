import { ICommand } from './Abstract';

declare module 'discord.js' {
	export interface Client {
		commands: Collection<string, ICommand>
		cooldowns: Collection<string, Collection<string, number>>
	}
}