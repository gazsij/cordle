import { ApplicationCommandOptionType } from 'discord-api-types/v9';
import { CommandInteraction, CacheType, ButtonInteraction, SelectMenuInteraction, AutocompleteInteraction, ContextMenuInteraction } from 'discord.js';

export interface IExport<T extends ICommand | IButton | ISelectMenu | IAutocomplete | IContextMenu> {
	default: T
}

export interface ICommand {
	customID: string
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

export interface IButton {
	customID: string
	execute: (interaction: ButtonInteraction<CacheType>) => Promise<void>
}

export interface ISelectMenu {
	customID: string
	placeholder: string
	options: ISelectMenuOptions[]
	execute: (interaction: SelectMenuInteraction<CacheType>) => Promise<void>
}

export interface ISelectMenuOptions {
	label: string
	description: string
	value: string
}

export interface IAutocomplete {
	customID: string
	execute: (interaction: AutocompleteInteraction<CacheType>) => Promise<void>
}

export interface IContextMenu {
	customID: string

	execute: (interaction: ContextMenuInteraction<CacheType>) => Promise<void>
}

export type IImportable = ICommand | IButton | ISelectMenu | IAutocomplete | IContextMenu;
