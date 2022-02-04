import { MessageButton, MessageAttachment, MessageEmbed } from 'discord.js';

import { GuessState } from './Constants';

export interface IGuess {
	state: GuessState
	letter: string
}

export interface IServer {
	discord_id: string
	date_joined: Date
}

export interface IReplyOptions {
	msg: string | string[],
	embed?: MessageEmbed,
	title?: string,
	attachment?: MessageAttachment,
	button?: MessageButton,
	ephemeral?: boolean
}

export interface IStatistics {
	gamesPlayed: number
	winPercentage: number
	currentStreak: number
	maxStreak: number
	today: number | undefined
	guesses: Map<number, number>
}
