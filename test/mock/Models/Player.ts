import { getModelForClass, index, modelOptions, prop } from '@typegoose/typegoose';

enum GuessState {
	Absent,
	Present,
	Correct
}

interface IGuess {
	state: GuessState
	letter: string
}

interface IGame {
	day: number
	success: boolean
	finished: boolean
	guesses: IGuess[][]
}

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

export interface IPlayer {
	discordID: string;
	games: IGame[];
}

export const Player = getModelForClass(PlayerModel);
