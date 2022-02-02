import mongoose, { Mongoose, Connection } from 'mongoose';

const connection = 'mongodb://localhost:27017/dev';
const collections = ['players'];

export class Database {
	private static mongooseInstance: Mongoose;
	private static mongooseConnection: Connection;

	public static async Connect() {
		if (Database.mongooseInstance) return Database.mongooseInstance;
		Database.mongooseConnection = mongoose.connection;
		Database.mongooseInstance = await mongoose.connect(connection);
		const colls = Database.mongooseConnection.collections;
		const seed = collections.reduce((acc: Promise<unknown>[], name) => {
			if (colls[name]) return acc;
			acc.push(Database.mongooseConnection.createCollection(name));
			return acc;
		}, []);
		await Promise.all(seed);
		return Database.mongooseInstance;
	}

	public static async Close() {
		const colls = Database.mongooseConnection.collections;
		const drop = collections.reduce((acc: Promise<unknown>[], name) => {
			if (!colls[name]) return acc;
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
