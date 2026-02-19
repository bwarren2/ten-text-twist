<script>
	import { gameStats } from '$lib/state/stats.svelte.js';
	import { formatTime } from '$lib/utils/timer.js';

	let { onClose } = $props();

	const stats = $derived(gameStats.data);
	const maxDist = $derived(Math.max(1, ...stats.scoreDistribution));
</script>

<div class="overlay" onclick={onClose} role="presentation">
	<div class="modal" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.key === 'Escape' && onClose()} role="dialog" aria-label="Statistics" tabindex="-1">
		<button class="close-btn" onclick={onClose} aria-label="Close">
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
			</svg>
		</button>

		<h2 class="title">Statistics</h2>

		<div class="stat-grid">
			<div class="stat">
				<span class="stat-num">{stats.gamesPlayed}</span>
				<span class="stat-label">Played</span>
			</div>
			<div class="stat">
				<span class="stat-num">{stats.gamesPlayed > 0 ? Math.round(stats.gamesWon / stats.gamesPlayed * 100) : 0}</span>
				<span class="stat-label">Win %</span>
			</div>
			<div class="stat">
				<span class="stat-num">{stats.currentStreak}</span>
				<span class="stat-label">Streak</span>
			</div>
			<div class="stat">
				<span class="stat-num">{stats.maxStreak}</span>
				<span class="stat-label">Max Streak</span>
			</div>
		</div>

		{#if stats.bestTime !== null}
			<div class="best-time">
				Best time: <strong>{formatTime(stats.bestTime)}</strong>
			</div>
		{/if}

		<h3 class="dist-title">Score Distribution</h3>
		<div class="distribution">
			{#each stats.scoreDistribution as count, i}
				<div class="dist-row">
					<span class="dist-label">{i}</span>
					<div class="dist-bar-container">
						<div
							class="dist-bar"
							style="width: {Math.max(8, (count / maxDist) * 100)}%"
						>
							{count}
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	.overlay {
		position: fixed;
		inset: 0;
		background: var(--color-overlay);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 50;
		padding: 16px;
	}

	.modal {
		background: var(--color-modal-bg);
		border-radius: var(--radius-lg);
		padding: 24px;
		max-width: 400px;
		width: 100%;
		max-height: 85vh;
		overflow-y: auto;
		position: relative;
		animation: slideUp 0.3s ease-out;
	}

	@keyframes slideUp {
		from { opacity: 0; transform: translateY(40px); }
		to { opacity: 1; transform: translateY(0); }
	}

	.close-btn {
		position: absolute;
		top: 12px;
		right: 12px;
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		color: var(--color-text-muted);
	}

	.close-btn:hover {
		background: var(--color-surface-hover);
		color: var(--color-text);
	}

	.title {
		text-align: center;
		font-size: 1.1rem;
		margin-bottom: 16px;
	}

	.stat-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 8px;
		margin-bottom: 16px;
	}

	.stat {
		text-align: center;
	}

	.stat-num {
		font-size: 1.8rem;
		font-weight: 700;
		display: block;
	}

	.stat-label {
		font-size: 0.7rem;
		color: var(--color-text-muted);
	}

	.best-time {
		text-align: center;
		font-size: 0.85rem;
		color: var(--color-text-muted);
		margin-bottom: 16px;
	}

	.dist-title {
		font-size: 0.9rem;
		text-align: center;
		margin-bottom: 8px;
	}

	.distribution {
		display: flex;
		flex-direction: column;
		gap: 3px;
	}

	.dist-row {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.dist-label {
		font-size: 0.8rem;
		font-weight: 600;
		width: 20px;
		text-align: right;
	}

	.dist-bar-container {
		flex: 1;
	}

	.dist-bar {
		background: var(--color-correct);
		color: white;
		font-size: 0.7rem;
		font-weight: 700;
		padding: 2px 6px;
		border-radius: 3px;
		text-align: right;
		min-width: 20px;
		transition: width 0.3s ease-out;
	}
</style>
