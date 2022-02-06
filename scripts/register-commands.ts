import { CommandBuilder } from '../src/Helpers';
import { HandlerType, ICommand } from '../src/Types';

async function main() {
	const commands = await CommandBuilder.ImportFiles<ICommand>(HandlerType.Commands);
	await CommandBuilder.RegisterCommands(commands);
}

try {
	main();
} catch (error) {
	console.log(error);
}
