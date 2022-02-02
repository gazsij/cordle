import { InteractionReplyOptions, MessageActionRow, MessageAttachment, MessageEmbed } from 'discord.js';
import { createCanvas, registerFont } from 'canvas';

import { Config } from './Config';
import type { IGuess, IReplyOptions, IStatistics } from '../Types/Abstract';
import { GuessState } from '../Types/Constants';

registerFont('./static/ClearSans-Regular.ttf', { family: 'ClearSans' });
registerFont('./static/ClearSans-Bold.ttf', { family: 'ClearSans', weight: 'bold' });

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

		ctx.lineWidth = 2;
		ctx.strokeStyle = '#565758';

		ctx.font = '32px ClearSans';
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

	public static StatisticsToImage(stats: IStatistics): MessageAttachment {
		//const canvas = createCanvas(420, 180);
		const canvas = createCanvas(420, 340);
		const ctx = canvas.getContext('2d');

		ctx.fillStyle = '#d7dae0';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';

		ctx.font = 'bold 20px ClearSans';
		ctx.fillText('STATISTICS', 210, 30);

		ctx.font = '40px ClearSans';
		ctx.fillText(stats.gamesPlayed.toString(), 120, 70);
		ctx.fillText(stats.winPercentage.toString(), 180, 70);
		ctx.fillText(stats.currentStreak.toString(), 240, 70);
		ctx.fillText(stats.maxStreak.toString(), 300, 70);

		ctx.font = 'bold 14px ClearSans';
		ctx.fillText('Played', 120, 100);
		ctx.fillText('Win %', 180, 100);
		ctx.fillText('Current', 240, 100);
		ctx.fillText('Streak', 240, 115);
		ctx.fillText('Max', 300, 100);
		ctx.fillText('Streak', 300, 115);

		ctx.font = 'bold 20px ClearSans';
		ctx.fillText('GUESS DISTRIBUTION', 210, 150);

		ctx.font = 'bold 12px ClearSans';
		ctx.textAlign = 'right';
		ctx.textBaseline = 'top';

		const mostCommonGuess = Math.max(...[...stats.guesses].map(([, value]) => value));

		for (let guess = 1; guess < 7; guess++) {
			const count = stats.guesses.get(guess) ?? 0;
			const width = Math.max(0.07, Math.round(count / mostCommonGuess * 100) / 100) * 370;
			const y = 160 + (24 * guess);

			ctx.fillStyle = stats.today == guess ? '#538d4e' : '#565758';
			ctx.fillRect(30, y, width, 20);

			ctx.fillStyle = '#d7dae0';
			ctx.fillText(guess.toString(), 20, y);
			ctx.fillText(count.toString(), 20 + width, y);
		}

		return new MessageAttachment(canvas.toBuffer(), 'stats.png');
	}
}
