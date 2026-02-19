import { formatTime } from './timer.js';

/**
 * Generate the share text for a completed game.
 * @param {object} params
 * @param {number} params.puzzleNumber
 * @param {Array<{status: 'solved' | 'perfected' | 'hinted' | 'missed'}>} params.sets
 * @param {boolean} params.timed
 * @param {number} [params.elapsedMs]
 * @returns {string}
 */
export function generateShareText({ puzzleNumber, sets, timed, elapsedMs }) {
	const solved = sets.filter(s => s.status !== 'missed').length;
	const total = sets.length;

	const emojiMap = {
		solved: '🟩',
		perfected: '🟨',
		hinted: '🟦',
		missed: '⬛'
	};

	const emojiGrid = sets.map(s => emojiMap[s.status] || '⬛').join('');

	let line1 = `Ten Text Twist #${puzzleNumber} — ${solved}/${total}`;
	if (timed && elapsedMs != null) {
		line1 += ` ⏱️ ${formatTime(elapsedMs)}`;
	}

	return `${line1}\n\n${emojiGrid}\n\ntenTextTwist.com`;
}

/**
 * Copy text to clipboard, falling back from navigator.share to clipboard API.
 * @param {string} text
 * @returns {Promise<boolean>} true if shared/copied successfully
 */
export async function shareOrCopy(text) {
	if (navigator.share) {
		try {
			await navigator.share({ text });
			return true;
		} catch {
			// User cancelled or share failed, fall through to clipboard
		}
	}
	if (navigator.clipboard) {
		try {
			await navigator.clipboard.writeText(text);
			return true;
		} catch {
			return false;
		}
	}
	return false;
}
