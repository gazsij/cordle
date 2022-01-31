import mongoose, { Mongoose, Connection } from 'mongoose';

const connection = 'mongodb://localhost:27017/dev';
const collections = ['Payer'];

export class Database {
	private static mongooseInstance: Mongoose;
	private static mongooseConnection: Connection;

	public static async Connect() {
		if (Database.mongooseInstance) return Database.mongooseInstance;
		Database.mongooseConnection = mongoose.connection;
		Database.mongooseInstance = await mongoose.connect(connection);
		const seed = collections.reduce((acc: Promise<unknown>[], name) => {
			acc.push(Database.mongooseConnection.createCollection(name));
			return acc;
		}, []);
		await Promise.all(seed);
		return Database.mongooseInstance;
	}

	public static async Close() {
		const drop = collections.reduce((acc: Promise<unknown>[], name) => {
			acc.push(Database.mongooseConnection.dropCollection(name));
			return acc;
		}, []);
		await Promise.all(drop);
		await Database.mongooseConnection.close();
	}

	public static IsConnected() {
		return !!Database.mongooseConnection.db;
	}
}
