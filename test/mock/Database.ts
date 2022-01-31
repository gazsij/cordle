import mongoose, { Mongoose, Connection } from 'mongoose';

const connection = 'mongodb://localhost:27017/dev';

export class Database {
	private static mongooseInstance: Mongoose;
	private static mongooseConnection: Connection;

	public static async Connect() {
		if (Database.mongooseInstance) return Database.mongooseInstance;
		Database.mongooseConnection = mongoose.connection;
		Database.mongooseInstance = await mongoose.connect(connection);
		return Database.mongooseInstance;
	}

	public static async Close() {
		await Database.mongooseConnection.close();
	}

	public static IsConnected() {
		return !!Database.mongooseConnection.db;
	}
}
