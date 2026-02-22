<script>
	import { game } from '$lib/state/game.svelte.js';
	import SetIndicator from './SetIndicator.svelte';
	import InputArea from './InputArea.svelte';
	import LetterTiles from './LetterTiles.svelte';
	import Keyboard from './Keyboard.svelte';
	import HintButton from './HintButton.svelte';
	import Timer from './Timer.svelte';
	import FoundWords from './FoundWords.svelte';
	import Toast from './Toast.svelte';

	let { onFinish } = $props();

	// Which display letter indices are used by the current input
	const usedIndices = $derived(game.inputIndices);

	function handleKeydown(e) {
		if (game.phase !== 'playing') return;

		const key = e.key;

		if (key === 'Enter') {
			e.preventDefault();
			game.submit();
		} else if (key === 'Backspace') {
			e.preventDefault();
			game.removeLetter();
		} else if (key === ' ') {
			e.preventDefault();
			game.shuffleLetters();
		} else if (key === 'Tab') {
			e.preventDefault();
			game.skip();
		} else if (/^[a-zA-Z]$/.test(key)) {
			e.preventDefault();
			game.addLetter(key.toUpperCase());
		}
	}

	function handleTileClick(letter, index) {
		game.addLetter(letter, index);
	}

	// Track time on current set for skip tip
	let setEnteredAt = $state(Date.now());
	let secondsOnSet = $state(0);
	let tipDismissedForever = $state(false);

	// Reset timer when set changes
	$effect(() => {
		game.currentSetIndex; // subscribe
		setEnteredAt = Date.now();
		secondsOnSet = 0;
	});

	// Tick seconds on set
	let tickInterval = $state(null);
	$effect(() => {
		if (game.phase === 'playing') {
			tickInterval = setInterval(() => {
				secondsOnSet = (Date.now() - setEnteredAt) / 1000;
			}, 1000);
			return () => clearInterval(tickInterval);
		}
	});

	const hasFoundAnyWord = $derived(game.foundWords.some(fw => fw.length > 0));
	const showSkipTip = $derived(
		!tipDismissedForever && game.phase === 'playing' && (secondsOnSet >= 25 || hasFoundAnyWord)
	);

	let finishCalled = $state(false);
	$effect(() => {
		if (game.phase === 'finished' && onFinish && !finishCalled) {
			finishCalled = true;
			// Small delay to let last animation play
			setTimeout(() => onFinish(), 200);
		}
	});
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="game">
	<div class="game-top">
		{#if game.timed}
			<Timer timeRemaining={game.timeRemaining} started={game.timerStarted} />
		{:else}
			<div class="puzzle-label">Puzzle #{game.puzzleNumber}</div>
		{/if}

		<SetIndicator
			statuses={game.setStatuses}
			currentIndex={game.currentSetIndex}
			onSelect={(i) => game.goToSet(i)}
		/>

		{#if showSkipTip}
			<div class="skip-tip">
				You can skip to the next word and come back any time
				<button class="tip-dismiss" onclick={() => tipDismissedForever = true} aria-label="Dismiss tip">&times;</button>
			</div>
		{/if}
	</div>

	<div class="game-main">
		{#if game.currentSet}
			{@const totalAnswers = game.currentSet.answers.length}

			<div class="set-info">
				<span class="set-number">Set {game.currentSetIndex + 1}/10</span>
				{#if totalAnswers > 1}
					<span class="multi-badge">{totalAnswers} anagrams</span>
				{/if}
			</div>

			<FoundWords
				foundWords={game.currentFoundWords}
				totalAnswers={totalAnswers}
			/>

			<div class="input-section">
				<InputArea
					input={game.input}
					shaking={game.inputShaking}
					onSlotClick={(i) => game.removeLetterAt(i)}
				/>
			</div>

			<LetterTiles
				letters={game.displayLetters}
				{usedIndices}
				onTileClick={handleTileClick}
				onShuffle={() => game.shuffleLetters()}
			/>

			<div class="hint-section">
				<HintButton
					used={game.currentHintUsed}
					definition={game.currentHintUsed ? game.getHintDefinition() : null}
					onUseHint={() => game.useHint()}
				/>
			</div>
		{/if}
	</div>

	<div class="game-bottom">
		<Keyboard
			letters={game.displayLetters}
			usedLetters={usedIndices}
			onKey={handleTileClick}
			onEnter={() => game.submit()}
			onBackspace={() => game.removeLetter()}
			onShuffle={() => game.shuffleLetters()}
			onSkip={() => game.skip()}
		/>

		<button class="done-btn" onclick={() => game.giveUp()}>
			I'm Done
		</button>
	</div>

	<Toast message={game.toastMessage} />
</div>

<style>
	.game {
		display: flex;
		flex-direction: column;
		height: 100%;
		max-width: 500px;
		margin: 0 auto;
		padding: 0 12px;
	}

	.game-top {
		padding: 8px 0;
		flex-shrink: 0;
	}

	.skip-tip {
		text-align: center;
		font-size: 0.8rem;
		color: var(--color-hint-bright);
		background: rgba(58, 123, 213, 0.1);
		padding: 6px 28px 6px 12px;
		border-radius: var(--radius);
		position: relative;
		animation: fadeIn 0.3s ease-out;
	}

	.tip-dismiss {
		position: absolute;
		right: 6px;
		top: 50%;
		transform: translateY(-50%);
		font-size: 1.1rem;
		color: var(--color-text-muted);
		width: 20px;
		height: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
	}

	.tip-dismiss:hover {
		color: var(--color-text);
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	.puzzle-label {
		text-align: center;
		font-size: 0.85rem;
		color: var(--color-text-muted);
		font-weight: 600;
		margin-bottom: 4px;
	}

	.game-main {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 16px;
		padding: 8px 0;
	}

	.set-info {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
	}

	.set-number {
		font-size: 0.85rem;
		color: var(--color-text-muted);
		font-weight: 600;
	}

	.multi-badge {
		font-size: 0.75rem;
		font-weight: 700;
		color: var(--color-perfected-bright);
		background: rgba(181, 159, 59, 0.15);
		padding: 2px 8px;
		border-radius: 10px;
	}

	.input-section {
		padding: 4px 0;
	}

	.hint-section {
		display: flex;
		justify-content: center;
	}

	.game-bottom {
		flex-shrink: 0;
		padding: 4px 0 12px;
	}

	.done-btn {
		display: block;
		margin: 12px auto 0;
		padding: 12px 36px;
		border-radius: 24px;
		background: var(--color-surface);
		border: 2px solid var(--color-border);
		color: var(--color-text);
		font-size: 1rem;
		font-weight: 700;
		letter-spacing: 0.02em;
		transition: all 0.2s;
		min-height: 44px;
	}

	.done-btn:hover {
		background: var(--color-error);
		border-color: var(--color-error);
		color: white;
	}
</style>
