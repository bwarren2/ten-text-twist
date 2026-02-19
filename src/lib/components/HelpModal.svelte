<script>
	let { onClose } = $props();
</script>

<div class="overlay" onclick={onClose} role="presentation">
	<div class="modal" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.key === 'Escape' && onClose()} role="dialog" aria-label="How to play" tabindex="-1">
		<button class="close-btn" onclick={onClose} aria-label="Close">
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
			</svg>
		</button>

		<h2 class="title">How to Play</h2>

		<div class="rules">
			<p>Unscramble <strong>10 sets</strong> of 6 letters to find words.</p>

			<h3>Gameplay</h3>
			<ul>
				<li>Each set has one or more valid anagram answers</li>
				<li>Type letters or click tiles to build your word</li>
				<li>Press <kbd>Enter</kbd> to submit, <kbd>Backspace</kbd> to delete</li>
				<li>Press <kbd>Space</kbd> to shuffle letters, <kbd>Tab</kbd> to skip</li>
				<li>Navigate freely between sets using the numbered dots</li>
			</ul>

			<h3>Hints</h3>
			<ul>
				<li>Each set has one hint that reveals a word's definition</li>
				<li>Using a hint changes that set's color in results</li>
			</ul>

			<h3>Scoring</h3>
			<div class="scoring">
				<div class="score-item"><span class="emoji">🟩</span> Solved — found at least one word</div>
				<div class="score-item"><span class="emoji">🟨</span> Perfected — found ALL anagrams, no hint</div>
				<div class="score-item"><span class="emoji">🟦</span> Hinted — solved with a hint</div>
				<div class="score-item"><span class="emoji">⬛</span> Missed — no words found</div>
			</div>

			<h3>Modes</h3>
			<ul>
				<li><strong>Timed:</strong> 5 minutes, timer starts on first input</li>
				<li><strong>Untimed:</strong> Take as long as you need</li>
			</ul>

			<p class="note">A new puzzle is available every day!</p>
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
		max-width: 420px;
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
	}

	.title {
		text-align: center;
		font-size: 1.1rem;
		margin-bottom: 16px;
	}

	.rules {
		font-size: 0.85rem;
		line-height: 1.5;
	}

	.rules h3 {
		font-size: 0.9rem;
		margin: 14px 0 6px;
	}

	.rules ul {
		padding-left: 20px;
	}

	.rules li {
		margin-bottom: 4px;
	}

	kbd {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 3px;
		padding: 1px 5px;
		font-size: 0.8rem;
		font-family: inherit;
	}

	.scoring {
		display: flex;
		flex-direction: column;
		gap: 4px;
		margin: 4px 0;
	}

	.score-item {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.emoji {
		font-size: 1.2rem;
	}

	.note {
		margin-top: 12px;
		text-align: center;
		color: var(--color-text-muted);
		font-style: italic;
	}
</style>
