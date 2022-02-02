import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('1234567890', 20);

export const discordID = () => nanoid();
