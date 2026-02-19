const PREFIX = 'ttt_';

/**
 * Load a value from localStorage.
 * @template T
 * @param {string} key
 * @param {T} fallback
 * @returns {T}
 */
export function load(key, fallback) {
	if (typeof localStorage === 'undefined') return fallback;
	try {
		const raw = localStorage.getItem(PREFIX + key);
		if (raw === null) return fallback;
		return JSON.parse(raw);
	} catch {
		return fallback;
	}
}

/**
 * Save a value to localStorage.
 * @param {string} key
 * @param {any} value
 */
export function save(key, value) {
	if (typeof localStorage === 'undefined') return;
	try {
		localStorage.setItem(PREFIX + key, JSON.stringify(value));
	} catch {
		// Storage full or unavailable
	}
}

/**
 * Remove a value from localStorage.
 * @param {string} key
 */
export function remove(key) {
	if (typeof localStorage === 'undefined') return;
	localStorage.removeItem(PREFIX + key);
}
