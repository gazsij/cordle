import { model, Schema, Document } from 'mongoose';

import { IGame } from '../Types/Abstract';

interface IPlayer {
	discordID: string
	games: IGame[]
}

interface IPlayerDoc extends IPlayer, Document { }

const PlayerSchemaFields = {
	discordID: { type: String, require: true, unique: true },
	games: [
		{
			day: { type: Number, require: true },
			success: { type: Boolean, require: true },
			finished: { type: Boolean, require: true },
			guesses: [[
				{
					state: { type: Number, require: true },
					letter: { type: String, require: true, maxlength: 1, trim: true, uppercase: true }
				}
			]]
		}
	]
};

const PlayerSchema = new Schema(PlayerSchemaFields);

const Player = model('Player', PlayerSchema);

export { IPlayer, IPlayerDoc, Player };