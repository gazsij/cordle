import { ApplicationCommandOptionType } from 'discord-api-types/v9';
import { Client, Collection, CommandInteraction, CacheType, ButtonInteraction, MessageButton, MessageAttachment, MessageEmbed } from 'discord.js';

import { GuessState } from './Constants';

export interface IClient extends Client {
	commands: Collection<string, ICommand>
	buttons: Collection<string, IButton>
}

export interface ICommand {
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

export interface IGuess {
	state: GuessState
	letter: string
}

export interface IGame {
	day: number
	success: boolean
	finished: boolean
	guesses: IGuess[][]
}

export interface IReplyOptions {
	msg: string | string[],
	embed?: MessageEmbed,
	title?: string,
	attachment?: MessageAttachment,
	button?: MessageButton,
	ephemeral?: boolean
}