
export enum Env {
	dev = 'development',
	stg = 'staging',
	prod = 'production'
}

export enum GuessState {
	Absent,
	Present,
	Correct
}

export enum HandlerType {
	Commands = 'Commands',
	Buttons = 'Buttons',
	SelectMenus = 'SelectMenus',
	Autocompletes = 'Autocompletes',
	ContextMenus = 'ContextMenus'
}
