import { PlayerModel } from '../Models';

export class PlayerRepo {

	public static async GetPlayer(discordID: string) {
		return await PlayerModel.findOne({ discordID });
	}

	public static async GetOrCreatePlayer(discordID: string) {
		const player = await PlayerRepo.GetPlayer(discordID);
		if (player)
			return player;

		return await PlayerModel.create({
			discordID,
			games: []
		});
	}
}
