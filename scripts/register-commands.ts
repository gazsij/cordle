import { Collection } from 'discord.js';
import { promisify } from 'util';
import glob from 'glob';
import path from 'path';

import { CommandBuilder } from '../src/Helpers';
import { ICommand, IExport } from '../src/Types';

const globPromise = promisify(glob);

async function main() {
	const commands = new Collection<string, ICommand>();

	const folder = path.resolve(`${__dirname}/../src/Commands/*{.js,.ts}`);
	const files = await globPromise(folder);

	for (const file of files) {
		const { default: data } = await import(file) as IExport<ICommand>;
		commands.set(data.customID, data);
	}
	console.log(`registering {${files.length}} commands`);
	const done = await CommandBuilder.RegisterCommands(commands);
	console.log(`successfully loaded {${done}} commands`);
}

try {
	main();
} catch (error) {
	console.log(error);
}