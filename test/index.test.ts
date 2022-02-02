import { Database } from './mock';

before('create database collections', async () => {
	await Database.Connect();
});
describe('register tests', async () => {
	require('./integration');
});
after('drop database collections', async () => {
	await Database.Close();
});
