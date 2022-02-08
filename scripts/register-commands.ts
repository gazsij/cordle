import { CommandBuilder } from '../src/Helpers';
import { HandlerType, ICommand, IContextMenu } from '../src/Types';
import debug from 'debug';

const logError = debug('cordle:scripts:error');

async function main() {
	const commands = await CommandBuilder.ImportFiles<ICommand>(HandlerType.Commands);
	const contextMenus = await CommandBuilder.ImportFiles<IContextMenu>(HandlerType.ContextMenus);
	await CommandBuilder.RegisterCommands(commands, contextMenus);
}

try {
	main();
} catch (error) {
	logError(error);
}
