<script>
	let { letters = [], usedIndices = [], onTileClick, onShuffle } = $props();
</script>

<div class="letter-tiles-row">
	<div class="tiles" role="group" aria-label="Available letters">
		{#each letters as letter, i}
			<button
				class="tile"
				class:used={usedIndices.includes(i)}
				disabled={usedIndices.includes(i)}
				aria-label="Letter {letter}"
				onclick={() => onTileClick(letter, i)}
			>
				{letter}
			</button>
		{/each}
	</div>
	<button class="shuffle-btn" onclick={onShuffle} aria-label="Shuffle letters">
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
			<polyline points="16 3 21 3 21 8"/>
			<line x1="4" y1="20" x2="21" y2="3"/>
			<polyline points="21 16 21 21 16 21"/>
			<line x1="15" y1="15" x2="21" y2="21"/>
			<line x1="4" y1="4" x2="9" y2="9"/>
		</svg>
	</button>
</div>

<style>
	.letter-tiles-row {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12px;
	}

	.tiles {
		display: flex;
		gap: 6px;
	}

	.tile {
		width: 48px;
		height: 48px;
		border-radius: var(--radius);
		background: var(--color-tile-bg);
		border: 2px solid var(--color-tile-border);
		color: var(--color-tile-text);
		font-size: 1.4rem;
		font-weight: 700;
		display: flex;
		align-items: center;
		justify-content: center;
		text-transform: uppercase;
		transition: all 0.15s;
		min-width: 44px;
		min-height: 44px;
	}

	.tile:not(.used):hover {
		background: var(--color-surface-hover);
		border-color: var(--color-text);
	}

	.tile:not(.used):active {
		transform: scale(0.95);
	}

	.tile.used {
		opacity: 0.3;
		cursor: default;
	}

	.shuffle-btn {
		width: 44px;
		height: 44px;
		border-radius: 50%;
		background: var(--color-surface);
		color: var(--color-text-muted);
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.15s;
	}

	.shuffle-btn:hover {
		background: var(--color-surface-hover);
		color: var(--color-text);
	}

	.shuffle-btn:active {
		transform: rotate(180deg);
	}
</style>
