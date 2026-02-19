<script>
	let { statuses = [], currentIndex = 0, onSelect } = $props();
</script>

<div class="set-indicator" role="tablist" aria-label="Puzzle sets">
	{#each statuses as status, i}
		<button
			class="dot"
			class:current={i === currentIndex}
			class:solved={status === 'solved'}
			class:perfected={status === 'perfected'}
			class:hinted={status === 'hinted'}
			class:missed={status === 'missed'}
			role="tab"
			aria-selected={i === currentIndex}
			aria-label="Set {i + 1}: {status}"
			onclick={() => onSelect(i)}
		>
			{i + 1}
		</button>
	{/each}
</div>

<style>
	.set-indicator {
		display: flex;
		gap: 6px;
		justify-content: center;
		padding: 8px 0;
	}

	.dot {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		font-size: 0.75rem;
		font-weight: 700;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--color-tile-bg);
		color: var(--color-text-muted);
		border: 2px solid transparent;
		transition: all 0.2s;
	}

	.dot.current {
		border-color: var(--color-text);
		color: var(--color-text);
	}

	.dot.solved {
		background: var(--color-correct);
		color: white;
	}

	.dot.perfected {
		background: var(--color-perfected);
		color: white;
	}

	.dot.hinted {
		background: var(--color-hint);
		color: white;
	}

	.dot.missed {
		background: var(--color-missed);
		color: var(--color-text-muted);
	}
</style>
