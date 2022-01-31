import { InteractionReplyOptions, MessageActionRow, MessageAttachment, MessageEmbed } from 'discord.js';
import { createCanvas } from 'canvas';

import { Config } from './Config';
import type { IGuess, IReplyOptions } from '../Types/Abstract';
import { GuessState } from '../Types/Constants';

export class Format {

	public static Embed(title?: string): MessageEmbed {
		const embed = new MessageEmbed()
			.setColor(Config.BOT_COLOR)
			.setFooter({ text: Config.BOT_VERSION, iconURL: Config.BOT_ICON });

		if (title != undefined)
			embed.setTitle(title);

		return embed;
	}

	public static Reply(options: IReplyOptions): InteractionReplyOptions {
		const embed = options.embed ?? Format.Embed(options.title);

		if (Array.isArray(options.msg))
			embed.setDescription(options.msg.join('\n'));
		else
			embed.setDescription(options.msg);

		const reply: InteractionReplyOptions = { embeds: [embed], ephemeral: options.ephemeral };

		if (options.attachment != undefined) {
			reply.files = [options.attachment];
			embed.setImage(`attachment://${options.attachment.name}`);
		}

		if (options.button != undefined) {
			const row = new MessageActionRow().addComponents(options.button);
			reply.components = [row];
		}

		return reply;
	}

	public static GuessesToEmoji(guesses: IGuess[][]): string {
		return guesses.map((guess: IGuess[]) => {
			return guess.map((g: IGuess) => {
				switch (g.state) {
					case GuessState.Correct:
						return '🟩';
					case GuessState.Present:
						return '🟨';
					case GuessState.Absent:
						return '⬛';
				}
			}).join('');
		}).join('\n');
	}

	public static GuessesToImage(guesses: IGuess[][]): MessageAttachment {
		const canvas = createCanvas(350, 420);
		const ctx = canvas.getContext('2d');

		ctx.fillStyle = '#121213';
		ctx.rect(0, 0, 350, 420);

		ctx.lineWidth = 2;
		ctx.strokeStyle = '#565758';

		ctx.font = '32px Sans';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';

		for (let row = 0; row < 6; row++) {
			for (let col = 0; col < 5; col++) {
				const x = 10 + col * 67;
				const y = 10 + row * 67;
				const guess = guesses[row];
				if (!guess) {
					ctx.strokeRect(x, y, 62, 62);
					continue;
				}

				const letter = guess[col];
				if (!letter) {
					ctx.strokeRect(x, y, 62, 62);
					continue;
				}

				switch (letter.state) {
					case GuessState.Correct:
						ctx.fillStyle = '#538d4e';
						break;
					case GuessState.Present:
						ctx.fillStyle = '#b59f3b';
						break;
					case GuessState.Absent:
						ctx.fillStyle = '#3a3a3c';
						break;
				}

				ctx.fillRect(x, y, 62, 62);
				ctx.stroke();

				ctx.fillStyle = '#d7dae0';
				ctx.fillText(letter.letter, x + 31, y + 31);
			}
		}

		return new MessageAttachment(canvas.toBuffer(), 'game.png');
	}
}
