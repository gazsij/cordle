import { getModelForClass } from '@typegoose/typegoose';

import { Player } from './Player';
import { Game } from './Game';

export const PlayerModel = getModelForClass(Player);
export const GameModel = getModelForClass(Game);
