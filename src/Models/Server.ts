import { index, modelOptions, prop, Ref } from '@typegoose/typegoose';

import { Game } from './Game';

@index({ discord_id: 1 }, { unique: true })
@modelOptions({ schemaOptions: { collection: 'servers' } })
export class Server {

	@prop({ required: true, unique: true })
	public discord_id: string;

	@prop({ required: true, default: () => new Date() })
	public date_joined: Date;

	@prop({ ref: () => Game })
	public games: Ref<Game>[];
}
