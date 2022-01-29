import { Client, Collection, CommandInteraction, CacheType } from 'discord.js';

export interface IClient extends Client {
	commands: Collection<string, ICommand>
}

export interface ICommand {
	name: string
	description: string
	usage?: string
	execute: (interaction: CommandInteraction<CacheType>) => void
}