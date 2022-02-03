import { getModelForClass } from '@typegoose/typegoose';

import { Server } from './Server';
import { Player } from './Player';
import { Game } from './Game';

export const ServerModel = getModelForClass(Server);
export const PlayerModel = getModelForClass(Player);
export const GameModel = getModelForClass(Game);
