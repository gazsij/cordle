import { index, modelOptions, prop, Ref } from '@typegoose/typegoose';

import type { IGuess } from '../Types/Abstract';
import { GuessState } from '../Types/Constants';
import { Player } from './Player';

class Guess {

	@prop({ required: true })
	public state: GuessState;

	@prop({ required: true, maxlength: 1, trim: true, uppercase: true })
	public letter: string;
}

@index({ player: 1, day: 1 }, { unique: true })
@modelOptions({ schemaOptions: { collection: 'games' } })
export class Game {

	@prop({ ref: () => Player })
	public player: Ref<Player>;

	@prop({ required: true })
	public day: number;

	@prop({ required: true })
	public success: boolean;

	@prop({ required: true })
	public finished: boolean;

	@prop({ type: () => [[Guess]], required: false, default: [[]] })
	public guesses: IGuess[][];
}
