/**
 * Sort letters of a word alphabetically to create a signature.
 * Words with the same signature are anagrams of each other.
 * @param {string} word
 * @returns {string}
 */
export function sortLetters(word) {
	return word.toLowerCase().split('').sort().join('');
}

/**
 * Check if a word is a valid anagram of the given letters.
 * @param {string} word
 * @param {string[]} letters
 * @returns {boolean}
 */
export function isValidAnagram(word, letters) {
	if (word.length !== letters.length) return false;
	const available = letters.map(l => l.toLowerCase());
	for (const char of word.toLowerCase()) {
		const idx = available.indexOf(char);
		if (idx === -1) return false;
		available.splice(idx, 1);
	}
	return true;
}

/**
 * Shuffle an array in place using Fisher-Yates algorithm.
 * @template T
 * @param {T[]} array
 * @returns {T[]}
 */
export function shuffle(array) {
	const arr = [...array];
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return arr;
}
