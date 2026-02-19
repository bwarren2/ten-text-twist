import { base } from '$app/paths';

/** The epoch date for puzzle numbering (UTC) */
const EPOCH = new Date('2026-02-18T00:00:00Z');

/**
 * Get today's puzzle number (1-indexed, days since epoch).
 * @returns {number}
 */
export function getTodaysPuzzleNumber() {
	const now = new Date();
	const utcNow = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
	const diff = utcNow - EPOCH.getTime();
	return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * Get the date string for a puzzle number.
 * @param {number} number
 * @returns {string} ISO date string (YYYY-MM-DD)
 */
export function getPuzzleDate(number) {
	const date = new Date(EPOCH.getTime() + (number - 1) * 24 * 60 * 60 * 1000);
	return date.toISOString().split('T')[0];
}

/**
 * Fetch a puzzle by number.
 * @param {number} number
 * @returns {Promise<import('./types').Puzzle>}
 */
export async function fetchPuzzle(number) {
	const padded = String(number).padStart(3, '0');
	const res = await fetch(`${base}/puzzles/${padded}.json`);
	if (!res.ok) throw new Error(`Failed to load puzzle ${number}`);
	return res.json();
}

/**
 * Fetch the puzzle manifest.
 * @returns {Promise<{epoch: string, totalPuzzles: number}>}
 */
export async function fetchManifest() {
	const res = await fetch(`${base}/puzzles/manifest.json`);
	if (!res.ok) throw new Error('Failed to load puzzle manifest');
	return res.json();
}
