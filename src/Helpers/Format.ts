import { InteractionReplyOptions, MessageAttachment, MessageEmbed } from 'discord.js';

import Config from './Config';

export default class Format {

	public static Embed(title?: string): MessageEmbed {
		const embed = new MessageEmbed()
			.setColor(Config.BOT_COLOR)
			.setFooter({ text: Config.BOT_VERSION, iconURL: Config.BOT_ICON });

		if (title != undefined)
			embed.setTitle(title);

		return embed;
	}

	public static Reply(options: { msg: string | string[], title?: string, attachment?: MessageAttachment, ephemeral?: boolean }): InteractionReplyOptions {
		const embed = Format.Embed(options.title);

		if (Array.isArray(options.msg))
			embed.setDescription(options.msg.join('\n'));
		else
			embed.setDescription(options.msg);

		const reply: InteractionReplyOptions = { embeds: [embed], ephemeral: options.ephemeral };

		if (options.attachment != undefined) {
			embed.setImage(`attachment://${options.attachment.name}`);
			reply.attachments = [options.attachment];
		}

		return reply;
	}
}