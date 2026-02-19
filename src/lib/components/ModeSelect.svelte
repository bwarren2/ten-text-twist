<script>
	let { puzzleNumber, onStart } = $props();
</script>

<div class="mode-select">
	<h1 class="game-title">Ten Text Twist</h1>
	<p class="subtitle">Daily Word Game</p>

	<div class="puzzle-info">
		<span class="puzzle-num">Puzzle #{puzzleNumber}</span>
	</div>

	<p class="prompt">Choose your mode:</p>

	<div class="modes">
		<button class="mode-btn timed" onclick={() => onStart(true)}>
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<circle cx="12" cy="12" r="10"/>
				<polyline points="12 6 12 12 16 14"/>
			</svg>
			<span class="mode-name">Timed</span>
			<span class="mode-desc">5 minutes</span>
		</button>

		<button class="mode-btn untimed" onclick={() => onStart(false)}>
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<circle cx="12" cy="12" r="10"/>
				<line x1="12" y1="8" x2="12" y2="16"/>
				<line x1="8" y1="12" x2="16" y2="12"/>
			</svg>
			<span class="mode-name">Untimed</span>
			<span class="mode-desc">No pressure</span>
		</button>
	</div>
</div>

<style>
	.mode-select {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 100%;
		padding: 40px 20px;
		gap: 12px;
	}

	.game-title {
		font-size: 2rem;
		font-weight: 800;
		letter-spacing: 0.05em;
		text-transform: uppercase;
	}

	.subtitle {
		font-size: 0.9rem;
		color: var(--color-text-muted);
		margin-bottom: 16px;
	}

	.puzzle-info {
		margin-bottom: 8px;
	}

	.puzzle-num {
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-text-muted);
	}

	.prompt {
		font-size: 0.9rem;
		color: var(--color-text-muted);
		margin-bottom: 8px;
	}

	.modes {
		display: flex;
		gap: 16px;
	}

	.mode-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		padding: 24px 32px;
		border-radius: var(--radius-lg);
		background: var(--color-surface);
		border: 2px solid var(--color-border);
		color: var(--color-text);
		transition: all 0.2s;
		min-width: 140px;
		min-height: 44px;
	}

	.mode-btn:hover {
		border-color: var(--color-text);
		background: var(--color-surface-hover);
	}

	.mode-name {
		font-size: 1.1rem;
		font-weight: 700;
	}

	.mode-desc {
		font-size: 0.8rem;
		color: var(--color-text-muted);
	}
</style>
