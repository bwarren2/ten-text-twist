import { load, save } from './persistence.js';
import { shuffle } from '../utils/anagram.js';
import { TIMED_DURATION } from '../utils/timer.js';
import { getTodaysPuzzleNumber } from '../utils/puzzle.js';

/**
 * @typedef {'idle' | 'playing' | 'finished'} GamePhase
 * @typedef {'active' | 'solved' | 'perfected' | 'hinted' | 'missed'} SetStatus
 * @typedef {{word: string, definition: string, pos: string}} Answer
 * @typedef {{letters: string[], answers: Answer[]}} PuzzleSet
 */

function createGameState() {
	/** @type {import('../utils/puzzle.js').Puzzle | null} */
	let puzzle = $state(null);
	let puzzleNumber = $state(0);
	/** @type {GamePhase} */
	let phase = $state('idle');
	let currentSetIndex = $state(0);
	let timed = $state(false);

	// Per-set state
	/** @type {string[][]} found words per set */
	let foundWords = $state([]);
	/** @type {boolean[]} hint used per set */
	let hintUsed = $state([]);
	/** @type {SetStatus[]} */
	let setStatuses = $state([]);

	// Input state
	let input = $state([]);
	/** @type {number[]} indices into displayLetters for each input letter */
	let inputIndices = $state([]);
	/** @type {string[]} shuffled display order of current set's letters */
	let displayLetters = $state([]);

	// Timer
	let timerStarted = $state(false);
	let startTime = $state(0);
	let elapsed = $state(0);
	let timerInterval = $state(null);

	// Toast
	let toastMessage = $state('');
	let toastTimeout = $state(null);

	// Input animation
	let inputShaking = $state(false);

	function showToast(msg, duration = 1500) {
		toastMessage = msg;
		if (toastTimeout) clearTimeout(toastTimeout);
		toastTimeout = setTimeout(() => { toastMessage = ''; }, duration);
	}

	function initSets(count) {
		foundWords = Array.from({ length: count }, () => []);
		hintUsed = Array(count).fill(false);
		setStatuses = Array(count).fill('active');
	}

	function startTimer() {
		if (timerStarted || !timed) return;
		timerStarted = true;
		startTime = Date.now();
		timerInterval = setInterval(() => {
			elapsed = Date.now() - startTime;
			if (timed && elapsed >= TIMED_DURATION) {
				finishGame();
			}
		}, 200);
	}

	function stopTimer() {
		if (timerInterval) {
			clearInterval(timerInterval);
			timerInterval = null;
		}
	}

	function updateDisplayLetters() {
		if (!puzzle) return;
		const set = puzzle.sets[currentSetIndex];
		displayLetters = shuffle([...set.letters]);
	}

	function clearInput() {
		input = [];
		inputIndices = [];
	}

	function saveProgress() {
		if (!puzzle) return;
		save(`game_${puzzleNumber}`, {
			puzzleNumber,
			phase,
			currentSetIndex,
			timed,
			foundWords,
			hintUsed,
			setStatuses,
			timerStarted,
			elapsed: timerStarted ? Date.now() - startTime : 0
		});
	}

	function loadProgress(num) {
		return load(`game_${num}`, null);
	}

	function resolveSetStatus(index) {
		if (!puzzle) return;
		const set = puzzle.sets[index];
		const found = foundWords[index];
		if (found.length === 0) return 'active';
		if (found.length === set.answers.length) {
			return hintUsed[index] ? 'hinted' : 'perfected';
		}
		if (found.length > 0) {
			return hintUsed[index] ? 'hinted' : 'solved';
		}
		return 'active';
	}

	function finishGame() {
		stopTimer();
		phase = 'finished';
		// Mark remaining active sets as missed
		for (let i = 0; i < setStatuses.length; i++) {
			if (setStatuses[i] === 'active') {
				setStatuses[i] = 'missed';
			}
		}
		saveProgress();
	}

	function checkAllSetsResolved() {
		return setStatuses.every(s => s !== 'active');
	}

	function nextUnsolvedSet() {
		if (!puzzle) return currentSetIndex;
		for (let i = 1; i <= puzzle.sets.length; i++) {
			const idx = (currentSetIndex + i) % puzzle.sets.length;
			if (setStatuses[idx] === 'active') return idx;
		}
		return currentSetIndex;
	}

	return {
		get puzzle() { return puzzle; },
		get puzzleNumber() { return puzzleNumber; },
		get phase() { return phase; },
		get currentSetIndex() { return currentSetIndex; },
		get timed() { return timed; },
		get foundWords() { return foundWords; },
		get hintUsed() { return hintUsed; },
		get setStatuses() { return setStatuses; },
		get input() { return input; },
		get displayLetters() { return displayLetters; },
		get timerStarted() { return timerStarted; },
		get elapsed() { return elapsed; },
		get timeRemaining() { return Math.max(0, TIMED_DURATION - elapsed); },
		get toastMessage() { return toastMessage; },
		get inputShaking() { return inputShaking; },
		get inputIndices() { return inputIndices; },

		get currentSet() {
			if (!puzzle) return null;
			return puzzle.sets[currentSetIndex];
		},

		get currentFoundWords() {
			return foundWords[currentSetIndex] || [];
		},

		get currentHintUsed() {
			return hintUsed[currentSetIndex] || false;
		},

		get currentStatus() {
			return setStatuses[currentSetIndex] || 'active';
		},

		get solvedCount() {
			return setStatuses.filter(s => s !== 'missed' && s !== 'active').length;
		},

		get setsForShare() {
			return setStatuses.map(s => ({ status: s === 'active' ? 'missed' : s }));
		},

		/**
		 * Initialize a new game with a puzzle.
		 */
		startGame(puzzleData, isTimed) {
			puzzle = puzzleData;
			puzzleNumber = puzzleData.number;
			timed = isTimed;
			phase = 'playing';
			currentSetIndex = 0;
			initSets(puzzleData.sets.length);
			clearInput();
			updateDisplayLetters();
			timerStarted = false;
			elapsed = 0;
			stopTimer();
			saveProgress();
		},

		/**
		 * Restore a game from saved progress.
		 */
		restoreGame(puzzleData, progress) {
			puzzle = puzzleData;
			puzzleNumber = progress.puzzleNumber;
			timed = progress.timed;
			phase = progress.phase;
			currentSetIndex = progress.currentSetIndex;
			foundWords = progress.foundWords;
			hintUsed = progress.hintUsed;
			setStatuses = progress.setStatuses;
			clearInput();
			updateDisplayLetters();

			if (phase === 'playing' && progress.timed && progress.timerStarted) {
				timerStarted = true;
				elapsed = progress.elapsed;
				startTime = Date.now() - elapsed;
				timerInterval = setInterval(() => {
					elapsed = Date.now() - startTime;
					if (elapsed >= TIMED_DURATION) {
						finishGame();
					}
				}, 200);
			}
		},

		hasProgress(num) {
			return loadProgress(num) !== null;
		},

		getProgress(num) {
			return loadProgress(num);
		},

		/** Add a letter to the input */
		addLetter(letter, sourceIndex) {
			if (phase !== 'playing') return;
			if (input.length >= 6) return;
			startTimer();

			const upperLetter = letter.toUpperCase();
			let chosenIndex;

			if (sourceIndex !== undefined && displayLetters[sourceIndex] === upperLetter && !inputIndices.includes(sourceIndex)) {
				// Tile tap: use the exact tile that was clicked
				chosenIndex = sourceIndex;
			} else {
				// Keyboard input: find first available tile with this letter
				chosenIndex = displayLetters.findIndex((l, i) => l === upperLetter && !inputIndices.includes(i));
				if (chosenIndex === -1) return;
			}

			input = [...input, upperLetter];
			inputIndices = [...inputIndices, chosenIndex];
			saveProgress();
		},

		/** Remove last letter from input */
		removeLetter() {
			if (input.length === 0) return;
			input = input.slice(0, -1);
			inputIndices = inputIndices.slice(0, -1);
		},

		/** Remove letter at specific index */
		removeLetterAt(index) {
			if (index < 0 || index >= input.length) return;
			input = [...input.slice(0, index), ...input.slice(index + 1)];
			inputIndices = [...inputIndices.slice(0, index), ...inputIndices.slice(index + 1)];
		},

		/** Submit current input */
		submit() {
			if (phase !== 'playing' || !puzzle) return;
			const word = input.join('').toLowerCase();
			const set = puzzle.sets[currentSetIndex];

			if (word.length !== 6) {
				inputShaking = true;
				setTimeout(() => { inputShaking = false; }, 400);
				showToast('Not enough letters');
				return;
			}

			// Check if already found
			if (foundWords[currentSetIndex].includes(word)) {
				inputShaking = true;
				setTimeout(() => { inputShaking = false; }, 400);
				showToast('Already found');
				clearInput();
				return;
			}

			// Check if valid answer
			const answer = set.answers.find(a => a.word === word);
			if (!answer) {
				inputShaking = true;
				setTimeout(() => { inputShaking = false; }, 400);
				showToast('Not a valid word');
				clearInput();
				return;
			}

			// Correct!
			foundWords[currentSetIndex] = [...foundWords[currentSetIndex], word];
			clearInput();

			// Update set status
			if (foundWords[currentSetIndex].length === set.answers.length) {
				setStatuses[currentSetIndex] = hintUsed[currentSetIndex] ? 'hinted' : 'perfected';
				showToast(set.answers.length > 1 ? 'Perfected! All anagrams found!' : 'Correct!');
			} else {
				setStatuses[currentSetIndex] = hintUsed[currentSetIndex] ? 'hinted' : 'solved';
				const remaining = set.answers.length - foundWords[currentSetIndex].length;
				showToast(`Correct! ${remaining} more anagram${remaining > 1 ? 's' : ''} to find`);
			}

			saveProgress();

			// Check if all sets resolved
			if (checkAllSetsResolved()) {
				setTimeout(() => finishGame(), 1200);
				return;
			}

			// Auto-advance if set is fully solved
			if (foundWords[currentSetIndex].length === set.answers.length) {
				setTimeout(() => {
					const next = nextUnsolvedSet();
					if (next !== currentSetIndex) {
						currentSetIndex = next;
						clearInput();
						updateDisplayLetters();
						saveProgress();
					}
				}, 1200);
			}
		},

		/** Use hint for current set */
		useHint() {
			if (phase !== 'playing' || !puzzle) return;
			if (hintUsed[currentSetIndex]) return;
			startTimer();
			hintUsed[currentSetIndex] = true;

			// Update status if already solved
			if (setStatuses[currentSetIndex] === 'solved' || setStatuses[currentSetIndex] === 'perfected') {
				setStatuses[currentSetIndex] = 'hinted';
			}

			saveProgress();
		},

		/** Get hint definition for current set */
		getHintDefinition() {
			if (!puzzle) return null;
			const set = puzzle.sets[currentSetIndex];
			// Show definition for the first unfound answer, or first answer if all found
			const unfound = set.answers.find(a => !foundWords[currentSetIndex].includes(a.word));
			const answer = unfound || set.answers[0];
			return { definition: answer.definition, pos: answer.pos };
		},

		/** Shuffle display letters */
		shuffleLetters() {
			if (!puzzle) return;
			startTimer();
			updateDisplayLetters();
		},

		/** Navigate to a specific set */
		goToSet(index) {
			if (!puzzle || index < 0 || index >= puzzle.sets.length) return;
			currentSetIndex = index;
			clearInput();
			updateDisplayLetters();
		},

		/** Skip to next unsolved set */
		skip() {
			if (!puzzle) return;
			const next = nextUnsolvedSet();
			if (next !== currentSetIndex) {
				currentSetIndex = next;
				clearInput();
				updateDisplayLetters();
			}
		},

		/** Finish game (player gives up on remaining sets) */
		giveUp() {
			finishGame();
		},

		showToast,
		saveProgress
	};
}

export const game = createGameState();
