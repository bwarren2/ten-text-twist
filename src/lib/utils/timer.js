/**
 * Format milliseconds as M:SS.
 * @param {number} ms
 * @returns {string}
 */
export function formatTime(ms) {
	const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

/** Total time for timed mode: 5 minutes in ms */
export const TIMED_DURATION = 5 * 60 * 1000;
