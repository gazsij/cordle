import mongoose, { Mongoose, Connection } from 'mongoose';
import { Db } from 'mongodb';
import debug from 'debug';

import Config from '../Helpers/Config';

const logSystem = debug('cordle:db:system');
const logEvent = debug('cordle:db:event');
const logError = debug('cordle:db:error');
const logWarn = debug('cordle:db:warn');

export default class Database {
	private static mongooseInstance: Mongoose;
	private static mongooseConnection: Connection;

	public static async Connect(): Promise<Mongoose> {
		logSystem('Connecting to db...');

		if (Database.mongooseInstance) return Database.mongooseInstance;

		Database.mongooseConnection = mongoose.connection;
		Database.mongooseConnection.once('open', () => {
			logSystem('Connected to MongoDB');
		});

		// => db error and warn handler
		Database.mongooseConnection.on('error', logError);
		Database.mongooseConnection.on('warn', logWarn);

		Database.mongooseInstance = await mongoose.connect(Config.DB_CONN as string, {

		});
		return Database.mongooseInstance;
	}

	public static GetConnection(): Db {
		return Database.mongooseConnection.db;
	}

	public static async Close(): Promise<void> {
		await Database.mongooseConnection.close();
		logEvent('[MongoDB] Closed connection.');
	}
}