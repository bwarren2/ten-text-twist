<script>
	let { foundWords = [], totalAnswers = 1 } = $props();
</script>

{#if foundWords.length > 0}
	<div class="found-words">
		<span class="count">{foundWords.length}/{totalAnswers}</span>
		<div class="words">
			{#each foundWords as word}
				<span class="word">{word}</span>
			{/each}
		</div>
	</div>
{/if}

<style>
	.found-words {
		display: flex;
		align-items: center;
		gap: 8px;
		justify-content: center;
		flex-wrap: wrap;
	}

	.count {
		font-size: 0.8rem;
		color: var(--color-text-muted);
		font-weight: 600;
	}

	.words {
		display: flex;
		gap: 6px;
		flex-wrap: wrap;
		justify-content: center;
	}

	.word {
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--color-correct-bright);
		background: rgba(83, 141, 78, 0.15);
		padding: 2px 8px;
		border-radius: 4px;
		text-transform: uppercase;
		animation: fadeIn 0.2s ease-out;
	}

	@keyframes fadeIn {
		from { opacity: 0; transform: scale(0.9); }
		to { opacity: 1; transform: scale(1); }
	}
</style>
