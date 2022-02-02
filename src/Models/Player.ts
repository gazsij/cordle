import { index, modelOptions, prop, Ref } from '@typegoose/typegoose';

import { Game } from './Game';

@index({ discordID: 1 }, { unique: true })
@modelOptions({ schemaOptions: { collection: 'players' } })
export class Player {

	@prop({ required: true, unique: true })
	public discordID: string;

	@prop({ ref: () => Game })
	public games: Ref<Game>[];
}
