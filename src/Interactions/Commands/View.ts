import { CommandInteraction, MessageButton } from 'discord.js';

import { ServerRepo, GameRepo } from '../../Repositories';
import { Words, Format } from '../../Helpers';
import { IReplyOptions, IServer, ICommand } from '../../Types';

const execute = async (interaction: CommandInteraction, server?: IServer) => {
	const type = server ? 'Server' : 'Global';
	const currentDay = Words.GetCurrentDay(server?.date_joined);

	const game = await GameRepo.GetGame(interaction.user.id, currentDay, server?.discord_id);
	if (!game)
		return interaction.reply(Format.Reply({ msg: `You have not started today's ${type} word yet.`, ephemeral: true }));

	const answer = Words.GetAnswer(currentDay, server);

	const img = Format.GuessesToImage(game.guesses);

	const footer = Words.GetCompletionMessage(game, answer.toUpperCase());

	const replyOptions: IReplyOptions = {
		msg: `${type} Word ${currentDay} ${game.guesses.length}/6\n\n${footer}`,
		attachment: img,
		ephemeral: true
	};

	if (game.finished)
		replyOptions.button = new MessageButton()
			.setLabel('Share')
			.setStyle('SUCCESS')
			.setCustomId(`share-${interaction.options.getSubcommand(true)}`);

	return interaction.reply(Format.Reply(replyOptions));
};

export default {
	customID: 'view',
	description: 'View game for the current word.',
	subCommands: [
		{
			name: 'global',
			description: 'View game for the current global word.',
			execute: interaction => execute(interaction)
		},
		{
			name: 'server',
			description: 'View game for the current server word.',
			execute: async interaction => {
				if (!interaction.inGuild())
					return interaction.reply(Format.Reply({ msg: 'Please use this command in a server.', ephemeral: true }));

				const server = await ServerRepo.GetServer(interaction.guildId);
				if (!server)
					return interaction.reply(Format.Reply({ msg: 'You have not started today\'s server word yet.', ephemeral: true }));

				return execute(interaction, server);
			}
		}
	]
} as ICommand;
