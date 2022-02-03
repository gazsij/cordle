import { index, modelOptions, prop, Ref } from '@typegoose/typegoose';

import { Game } from './Game';

@index({ discord_id: 1 }, { unique: true })
@modelOptions({ schemaOptions: { collection: 'players' } })
export class Player {

	@prop({ required: true, unique: true })
	public discord_id: string;

	@prop({ ref: () => Game })
	public games: Ref<Game>[];
}
