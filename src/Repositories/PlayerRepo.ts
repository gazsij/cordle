import { PlayerModel } from '../Models';

export class PlayerRepo {

	public static async GetPlayer(discordID: string) {
		return PlayerModel.findOne({ discord_id: discordID });
	}

	public static async GetOrCreatePlayer(discordID: string) {
		const player = await PlayerRepo.GetPlayer(discordID);
		if (player)
			return player;

		return PlayerModel.create({
			discord_id: discordID,
			games: []
		});
	}
}
