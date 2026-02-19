<script>
	import { formatTime } from '$lib/utils/timer.js';

	let { timeRemaining = 0, started = false } = $props();

	const urgent = $derived(timeRemaining < 30000 && started);
</script>

<div class="timer" class:urgent class:inactive={!started}>
	<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
		<circle cx="12" cy="12" r="10"/>
		<polyline points="12 6 12 12 16 14"/>
	</svg>
	<span>{formatTime(timeRemaining)}</span>
</div>

<style>
	.timer {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 1.1rem;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
		color: var(--color-text);
		transition: color 0.3s;
	}

	.inactive {
		color: var(--color-text-muted);
	}

	.urgent {
		color: var(--color-error);
	}
</style>
