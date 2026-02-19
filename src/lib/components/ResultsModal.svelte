<script>
	import { generateShareText, shareOrCopy } from '$lib/utils/share.js';
	import { game } from '$lib/state/game.svelte.js';

	let { onClose, onViewStats } = $props();
	let copied = $state(false);

	const solved = $derived(game.setStatuses.filter(s => s !== 'missed').length);

	const emojiMap = {
		solved: '🟩',
		perfected: '🟨',
		hinted: '🟦',
		missed: '⬛'
	};

	async function handleShare() {
		const text = generateShareText({
			puzzleNumber: game.puzzleNumber,
			sets: game.setsForShare,
			timed: game.timed,
			elapsedMs: game.elapsed
		});
		const success = await shareOrCopy(text);
		if (success) {
			copied = true;
			setTimeout(() => { copied = false; }, 2000);
		}
	}
</script>

<div class="overlay" onclick={onClose} role="presentation">
	<div class="modal" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.key === 'Escape' && onClose()} role="dialog" aria-label="Results" tabindex="-1">
		<button class="close-btn" onclick={onClose} aria-label="Close">
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
			</svg>
		</button>

		<h2 class="title">Puzzle #{game.puzzleNumber}</h2>

		<div class="score">
			<span class="score-num">{solved}</span>
			<span class="score-label">/ 10 solved</span>
		</div>

		<div class="emoji-grid">
			{#each game.setStatuses as status}
				<span class="emoji">{emojiMap[status] || '⬛'}</span>
			{/each}
		</div>

		<div class="legend">
			<span>🟩 solved</span>
			<span>🟨 perfected</span>
			<span>🟦 hinted</span>
			<span>⬛ missed</span>
		</div>

		{#if game.puzzle}
			<div class="answers-list">
				{#each game.puzzle.sets as set, i}
					<div class="answer-group" class:missed={game.setStatuses[i] === 'missed'}>
						<div class="answer-header">
							<span class="emoji-sm">{emojiMap[game.setStatuses[i]] || '⬛'}</span>
							<span class="set-label">Set {i + 1}</span>
						</div>
						{#each set.answers as answer}
							{@const found = game.foundWords[i]?.includes(answer.word)}
							<div class="answer-word" class:found>
								<span class="word">{answer.word}</span>
								<span class="def">{answer.pos} — {answer.definition}</span>
							</div>
						{/each}
					</div>
				{/each}
			</div>
		{/if}

		<div class="actions">
			<button class="share-btn" onclick={handleShare}>
				{copied ? 'Copied!' : 'Share'}
			</button>
			<button class="stats-btn" onclick={onViewStats}>
				View Stats
			</button>
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
		max-width: 440px;
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
		margin-bottom: 12px;
	}

	.score {
		text-align: center;
		margin-bottom: 12px;
	}

	.score-num {
		font-size: 2.5rem;
		font-weight: 700;
	}

	.score-label {
		font-size: 0.9rem;
		color: var(--color-text-muted);
	}

	.emoji-grid {
		display: flex;
		justify-content: center;
		gap: 4px;
		font-size: 1.4rem;
		margin-bottom: 8px;
	}

	.legend {
		display: flex;
		justify-content: center;
		gap: 12px;
		font-size: 0.7rem;
		color: var(--color-text-muted);
		margin-bottom: 16px;
	}

	.answers-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
		margin-bottom: 16px;
		max-height: 300px;
		overflow-y: auto;
	}

	.answer-group {
		border-left: 3px solid var(--color-correct);
		padding-left: 10px;
	}

	.answer-group.missed {
		border-left-color: var(--color-missed);
	}

	.answer-header {
		display: flex;
		align-items: center;
		gap: 6px;
		margin-bottom: 4px;
	}

	.emoji-sm {
		font-size: 0.9rem;
	}

	.set-label {
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--color-text-muted);
	}

	.answer-word {
		margin-left: 4px;
		margin-bottom: 2px;
	}

	.answer-word .word {
		font-weight: 700;
		font-size: 0.9rem;
		text-transform: uppercase;
		color: var(--color-text-muted);
	}

	.answer-word.found .word {
		color: var(--color-correct-bright);
	}

	.answer-word .def {
		font-size: 0.75rem;
		color: var(--color-text-muted);
		display: block;
		margin-left: 4px;
	}

	.actions {
		display: flex;
		gap: 10px;
		justify-content: center;
	}

	.share-btn, .stats-btn {
		padding: 10px 24px;
		border-radius: 20px;
		font-weight: 700;
		font-size: 0.9rem;
		min-height: 44px;
		transition: filter 0.15s;
	}

	.share-btn {
		background: var(--color-correct);
		color: white;
	}

	.stats-btn {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		color: var(--color-text);
	}

	.share-btn:hover, .stats-btn:hover {
		filter: brightness(1.15);
	}
</style>
