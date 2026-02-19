import { base } from '$app/paths';
import { getTodaysPuzzleNumber } from '$lib/utils/puzzle.js';

export async function load({ fetch }) {
	const puzzleNumber = getTodaysPuzzleNumber();
	const padded = String(puzzleNumber).padStart(3, '0');

	try {
		const res = await fetch(`${base}/puzzles/${padded}.json`);
		if (!res.ok) throw new Error('Puzzle not found');
		const puzzle = await res.json();
		return { puzzle, puzzleNumber };
	} catch {
		return { puzzle: null, puzzleNumber, error: 'Puzzle not available' };
	}
}
