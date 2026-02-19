<script>
	let { used = false, definition = null, onUseHint } = $props();

	let showDef = $state(false);

	function handleClick() {
		if (!used) {
			onUseHint();
		}
		showDef = !showDef;
	}
</script>

<div class="hint-container">
	<button
		class="hint-btn"
		class:used
		onclick={handleClick}
		aria-label={used ? 'Show hint definition' : 'Use hint (reveals definition)'}
	>
		<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
		</svg>
		{used ? 'Hint' : 'Use Hint'}
	</button>

	{#if used && showDef && definition}
		<div class="definition" role="tooltip">
			<span class="pos">{definition.pos}</span>
			<span class="def-text">{definition.definition}</span>
		</div>
	{/if}
</div>

<style>
	.hint-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
	}

	.hint-btn {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 8px 16px;
		border-radius: 20px;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		color: var(--color-text-muted);
		font-size: 0.85rem;
		font-weight: 600;
		transition: all 0.2s;
		min-height: 36px;
	}

	.hint-btn:hover {
		background: var(--color-surface-hover);
		color: var(--color-text);
	}

	.hint-btn.used {
		background: var(--color-hint);
		border-color: var(--color-hint);
		color: white;
	}

	.definition {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		padding: 8px 12px;
		max-width: 300px;
		text-align: center;
		animation: fadeIn 0.2s ease-out;
	}

	.pos {
		font-style: italic;
		color: var(--color-text-muted);
		font-size: 0.8rem;
		margin-right: 6px;
	}

	.def-text {
		font-size: 0.85rem;
		color: var(--color-text);
	}

	@keyframes fadeIn {
		from { opacity: 0; transform: translateY(-4px); }
		to { opacity: 1; transform: translateY(0); }
	}
</style>
