import { ApplicationCommandOptionType } from 'discord-api-types/v9';
import { CommandInteraction, MessageButton } from 'discord.js';

import { ServerRepo, GameRepo } from '../../Repositories';
import { Words, Format } from '../../Helpers';
import { IReplyOptions, IServer, ICommand } from '../../Types';

const execute = async (interaction: CommandInteraction, server?: IServer) => {
	const currentDay = Words.GetCurrentDay(server?.date_joined);
	const { game } = await GameRepo.GetOrCreateGame(interaction.user.id, currentDay, server?.discord_id);

	const type = server ? 'Server' : 'Global';
	const word = interaction.options.getString('word', true).toLowerCase();
	const validation = Words.ValidateGame(game, word, type);
	if (!validation.valid)
		return interaction.reply(Format.Reply({ msg: validation.msg, ephemeral: true }));

	const answer = Words.GetAnswer(currentDay, server);
	const guess = Words.CheckGuess(word, answer);

	const updatedGame = await GameRepo.AddGuess(interaction.user.id, currentDay, guess, server?.discord_id);
	const img = Format.GuessesToImage(updatedGame.guesses);

	const footer = Words.GetCompletionMessage(updatedGame, answer.toUpperCase());

	const replyOptions: IReplyOptions = {
		msg: `${type} Word ${currentDay} ${updatedGame.guesses.length}/6\n\n${footer}`,
		attachment: img,
		ephemeral: true
	};

	if (updatedGame.finished)
		replyOptions.button = new MessageButton()
			.setLabel('Share')
			.setStyle('SUCCESS')
			.setCustomId(`share-${interaction.options.getSubcommand(true)}`);

	return interaction.reply(Format.Reply(replyOptions));
};

export default {
	customID: 'guess',
	description: 'Submit a guess for the current word.',
	subCommands: [
		{
			name: 'global',
			description: 'Submit a guess for the current global word.',
			options: [
				{
					name: 'word',
					description: 'Word to guess.',
					dataType: ApplicationCommandOptionType.String,
					required: true
				}
			],
			execute: interaction => execute(interaction)
		},
		{
			name: 'server',
			description: 'Submit a guess for the current server word.',
			options: [
				{
					name: 'word',
					description: 'Word to guess.',
					dataType: ApplicationCommandOptionType.String,
					required: true
				}
			],
			execute: async interaction => {
				if (!interaction.inGuild())
					return interaction.reply(Format.Reply({ msg: 'Please use this command in a server.' }));

				const server = await ServerRepo.GetOrCreatServer(interaction.guildId);
				return execute(interaction, server);
			}
		}
	]
} as ICommand;
