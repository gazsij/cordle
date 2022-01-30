import answers from '../Static/answers.json';
import guesses from '../Static/guesses.json';

export default class Words {
	private static readonly Answers: string[] = answers;

	private static readonly Guesses: string[] = guesses;

	static readonly CurrentDay: number = Math.round(Math.abs((new Date(2021, 6, 18).getTime() - new Date().getTime()) / (24 * 60 * 60 * 1000)));

	public static GetAnswer(day: number): string {
		return Words.Answers[day];
	}

	public static ValidGuess(guess: string): boolean {
		return Words.Answers.includes(guess) || Words.Guesses.includes(guess);
	}
}