import { ApplicationCommandOptionType } from 'discord-api-types/v9';
import { CommandInteraction, CacheType, ButtonInteraction } from 'discord.js';

export interface ICommandExport {
	default: ICommand
}

export interface ICommand {
	name: string
	description: string
	options?: ICommandOption[]
	subCommands?: ISubCommand[]
	subCommandGroups?: ISubCommandGroup[]
	execute: (interaction: CommandInteraction<CacheType>) => Promise<void>
}

export interface ISubCommandGroup {
	name: string
	description: string
	subCommands?: ISubCommand[]
}

export interface ISubCommand {
	name: string
	description: string
	options?: ICommandOption[]
	execute: (interaction: CommandInteraction<CacheType>) => Promise<void>
}

export interface ICommandOption {
	name: string
	description: string
	dataType: ApplicationCommandOptionType
	required: boolean
	choices?: ICommandChoice[]
	options?: ICommandOption[]
}

export interface ICommandChoice {
	name: string
	value: string | number
}

export interface IButtonExport {
	default: IButton
}

export interface IButton {
	customID: string
	execute: (interaction: ButtonInteraction<CacheType>) => Promise<void>
}
