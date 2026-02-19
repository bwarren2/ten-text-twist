import { load, save } from './persistence.js';

const defaultStats = {
	gamesPlayed: 0,
	gamesWon: 0,
	currentStreak: 0,
	maxStreak: 0,
	bestTime: null,
	/** @type {number[]} Array of 11 elements: index = number of sets solved (0-10) */
	scoreDistribution: Array(11).fill(0),
	lastPuzzleNumber: 0
};

const saved = load('stats', defaultStats);

let stats = $state({ ...defaultStats, ...saved });

$effect.root(() => {
	$effect(() => {
		save('stats', stats);
	});
});

export const gameStats = {
	get data() { return stats; },

	/**
	 * Record a completed game.
	 * @param {object} params
	 * @param {number} params.puzzleNumber
	 * @param {number} params.solved - Number of sets solved (0-10)
	 * @param {number} [params.timeMs] - Time taken in ms (timed mode)
	 */
	recordGame({ puzzleNumber, solved, timeMs }) {
		stats.gamesPlayed++;
		stats.scoreDistribution[solved]++;

		const won = solved >= 1;
		if (won) {
			stats.gamesWon++;
		}

		// Streak tracking
		if (puzzleNumber === stats.lastPuzzleNumber + 1 && solved >= 5) {
			stats.currentStreak++;
		} else if (puzzleNumber !== stats.lastPuzzleNumber) {
			stats.currentStreak = solved >= 5 ? 1 : 0;
		}
		stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
		stats.lastPuzzleNumber = puzzleNumber;

		// Best time
		if (timeMs != null && (stats.bestTime === null || timeMs < stats.bestTime)) {
			stats.bestTime = timeMs;
		}
	}
};
