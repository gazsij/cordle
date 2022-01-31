import { getModelForClass, index, modelOptions, prop } from '@typegoose/typegoose';

import type { IGame, IGuess } from '../Types/Abstract';
import { GuessState } from '../Types/Constants';

class Guess {

	@prop({ required: true })
	public state: GuessState;

	@prop({ required: true, maxlength: 1, trim: true, uppercase: true })
	public letter: string;
}

class Game {

	@prop({ required: true })
	public day: number;

	@prop({ required: true })
	public success: boolean;

	@prop({ required: true })
	public finished: boolean;

	@prop({ type: () => [[Guess]], required: false, default: [[]] })
	public guesses: IGuess[][];
}

@index({ discordID: 1 }, { unique: true })
@modelOptions({ schemaOptions: { collection: 'players' } })
class PlayerModel {

	@prop({ required: true, unique: true })
	public discordID: string;

	@prop({ type: () => [Game], default: [] })
	public games: IGame[];
}

export const Player = getModelForClass(PlayerModel);
