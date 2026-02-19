<script>
	let { message = '' } = $props();
</script>

{#if message}
	<div class="toast" role="status" aria-live="polite">
		{message}
	</div>
{/if}

<style>
	.toast {
		position: fixed;
		top: 64px;
		left: 50%;
		transform: translateX(-50%);
		background: var(--color-text);
		color: var(--color-bg);
		padding: 10px 20px;
		border-radius: var(--radius);
		font-size: 0.9rem;
		font-weight: 600;
		z-index: 100;
		animation: fadeIn 0.15s ease-out;
		pointer-events: none;
	}

	@keyframes fadeIn {
		from { opacity: 0; transform: translateX(-50%) translateY(-10px); }
		to { opacity: 1; transform: translateX(-50%) translateY(0); }
	}
</style>
