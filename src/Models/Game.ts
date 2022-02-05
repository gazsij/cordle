import { index, modelOptions, prop, Ref } from '@typegoose/typegoose';

import { IGuess, GuessState } from '../Types';
import { Player } from './Player';
import { Server } from './Server';

@modelOptions({ schemaOptions: { _id: false } })
class Guess {

	@prop({ required: true })
	public state: GuessState;

	@prop({ required: true, maxlength: 1, trim: true, uppercase: true })
	public letter: string;
}

@index({ player: 1, server: 1, day: 1 }, { unique: true })
@modelOptions({ schemaOptions: { collection: 'games' } })
export class Game {

	@prop({ ref: () => Player, required: true })
	public player: Ref<Player>;

	@prop({ ref: () => Server })
	public server?: Ref<Server>;

	@prop({ required: true })
	public day: number;

	@prop({ required: true })
	public success: boolean;

	@prop({ required: true })
	public finished: boolean;

	@prop({ type: () => [[Guess]], required: false, default: [[]] })
	public guesses: IGuess[][];
}
