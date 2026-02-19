<script>
	let { input = [], maxLength = 6, shaking = false, onSlotClick } = $props();
</script>

<div class="input-area" class:shake={shaking} role="group" aria-label="Current word input">
	{#each Array(maxLength) as _, i}
		<button
			class="slot"
			class:filled={i < input.length}
			aria-label={i < input.length ? `Letter ${input[i]}, click to remove` : `Empty slot ${i + 1}`}
			onclick={() => i < input.length && onSlotClick(i)}
			disabled={i >= input.length}
		>
			{#if i < input.length}
				<span class="letter">{input[i]}</span>
			{/if}
		</button>
	{/each}
</div>

<style>
	.input-area {
		display: flex;
		gap: 6px;
		justify-content: center;
	}

	.slot {
		width: 48px;
		height: 48px;
		border-radius: var(--radius);
		background: var(--color-input-bg);
		border: 2px solid var(--color-input-border);
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 44px;
		min-height: 44px;
		transition: border-color 0.15s;
	}

	.slot.filled {
		border-color: var(--color-text);
	}

	.slot.filled:hover {
		background: var(--color-surface-hover);
	}

	.letter {
		font-size: 1.4rem;
		font-weight: 700;
		text-transform: uppercase;
		color: var(--color-text);
		animation: popIn 0.15s ease-out;
	}

	@keyframes popIn {
		from { transform: scale(0.5); opacity: 0; }
		to { transform: scale(1); opacity: 1; }
	}

	.shake {
		animation: shake 0.4s ease-in-out;
	}

	@keyframes shake {
		0%, 100% { transform: translateX(0); }
		10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
		20%, 40%, 60%, 80% { transform: translateX(4px); }
	}
</style>
