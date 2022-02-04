import { ServerModel } from '../Models';

export class ServerRepo {

	public static async GetServer(discordID: string) {
		return ServerModel.findOne({ discord_id: discordID });
	}

	public static async GetOrCreatServer(discordID: string) {
		const server = await ServerRepo.GetServer(discordID);
		if (server)
			return server;

		return ServerModel.create({
			discord_id: discordID,
			date_joined: new Date(),
			games: []
		});
	}
}
