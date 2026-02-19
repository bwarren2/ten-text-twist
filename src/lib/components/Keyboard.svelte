<script>
	let { letters = [], usedLetters = [], onKey, onEnter, onBackspace, onShuffle, onSkip } = $props();
</script>

<div class="keyboard" role="group" aria-label="On-screen keyboard">
	<div class="letter-row">
		{#each letters as letter, i}
			{@const used = usedLetters.includes(i)}
			<button
				class="key letter-key"
				class:used
				disabled={used}
				onclick={() => onKey(letter, i)}
				aria-label={letter}
			>
				{letter}
			</button>
		{/each}
	</div>
	<div class="action-row">
		<button class="key action-key" onclick={onBackspace} aria-label="Backspace">
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/>
				<line x1="18" y1="9" x2="12" y2="15"/>
				<line x1="12" y1="9" x2="18" y2="15"/>
			</svg>
		</button>
		<button class="key action-key enter-key" onclick={onEnter} aria-label="Submit">
			ENTER
		</button>
		<button class="key action-key" onclick={onShuffle} aria-label="Shuffle">
			<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
				<polyline points="16 3 21 3 21 8"/>
				<line x1="4" y1="20" x2="21" y2="3"/>
				<polyline points="21 16 21 21 16 21"/>
				<line x1="15" y1="15" x2="21" y2="21"/>
				<line x1="4" y1="4" x2="9" y2="9"/>
			</svg>
		</button>
		<button class="key action-key" onclick={onSkip} aria-label="Skip to next set">
			SKIP
		</button>
	</div>
</div>

<style>
	.keyboard {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 8px 0;
		width: 100%;
		max-width: 400px;
		margin: 0 auto;
	}

	.letter-row {
		display: flex;
		gap: 6px;
		justify-content: center;
	}

	.action-row {
		display: flex;
		gap: 6px;
		justify-content: center;
	}

	.key {
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--radius);
		font-weight: 700;
		transition: all 0.1s;
		min-height: 44px;
	}

	.key:active {
		transform: scale(0.95);
	}

	.letter-key {
		width: 48px;
		height: 52px;
		background: var(--color-key-bg);
		color: var(--color-key-text);
		font-size: 1.3rem;
	}

	.letter-key:hover:not(.used) {
		filter: brightness(1.2);
	}

	.letter-key.used {
		opacity: 0.3;
		cursor: default;
	}

	.action-key {
		padding: 0 14px;
		height: 44px;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		color: var(--color-text-muted);
		font-size: 0.75rem;
	}

	.action-key:hover {
		background: var(--color-surface-hover);
		color: var(--color-text);
	}

	.enter-key {
		background: var(--color-correct);
		border-color: var(--color-correct);
		color: white;
		padding: 0 20px;
	}

	.enter-key:hover {
		filter: brightness(1.15);
	}
</style>
