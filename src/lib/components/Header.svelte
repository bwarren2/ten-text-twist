<script>
	let { onSettings, onStats, onHelp } = $props();
</script>

<header class="header">
	<button class="header-btn" onclick={onHelp} aria-label="How to play">
		<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<circle cx="12" cy="12" r="10"/>
			<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
			<line x1="12" y1="17" x2="12.01" y2="17"/>
		</svg>
	</button>

	<h1 class="title">Ten Text Twist</h1>

	<div class="header-right">
		<button class="header-btn" onclick={onStats} aria-label="Statistics">
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<rect x="3" y="12" width="4" height="9"/>
				<rect x="10" y="7" width="4" height="14"/>
				<rect x="17" y="3" width="4" height="18"/>
			</svg>
		</button>
		<button class="header-btn" onclick={onSettings} aria-label="Settings">
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<circle cx="12" cy="12" r="3"/>
				<path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
			</svg>
		</button>
	</div>
</header>

<style>
	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 16px;
		height: 52px;
		border-bottom: 1px solid var(--color-border);
		flex-shrink: 0;
	}

	.title {
		font-size: 1.2rem;
		font-weight: 700;
		letter-spacing: 0.05em;
		text-transform: uppercase;
	}

	.header-right {
		display: flex;
		gap: 4px;
	}

	.header-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border-radius: var(--radius);
		color: var(--color-text);
		transition: background-color 0.15s;
	}

	.header-btn:hover {
		background-color: var(--color-surface-hover);
	}
</style>
