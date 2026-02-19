<script>
	import { settings } from '$lib/state/settings.svelte.js';

	let { onClose } = $props();
</script>

<div class="overlay" onclick={onClose} role="presentation">
	<div class="modal" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.key === 'Escape' && onClose()} role="dialog" aria-label="Settings" tabindex="-1">
		<button class="close-btn" onclick={onClose} aria-label="Close">
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
			</svg>
		</button>

		<h2 class="title">Settings</h2>

		<div class="setting-row">
			<div class="setting-info">
				<span class="setting-label">Dark Theme</span>
				<span class="setting-desc">Toggle dark/light appearance</span>
			</div>
			<button
				class="toggle"
				class:on={settings.theme === 'dark'}
				onclick={() => settings.toggleTheme()}
				role="switch"
				aria-checked={settings.theme === 'dark'}
				aria-label="Dark theme"
			>
				<span class="toggle-knob"></span>
			</button>
		</div>

		<div class="setting-row">
			<div class="setting-info">
				<span class="setting-label">Default Mode</span>
				<span class="setting-desc">Timed (5 min) or untimed play</span>
			</div>
			<button
				class="toggle"
				class:on={settings.mode === 'timed'}
				onclick={() => settings.mode = settings.mode === 'timed' ? 'untimed' : 'timed'}
				role="switch"
				aria-checked={settings.mode === 'timed'}
				aria-label="Timed mode"
			>
				<span class="toggle-knob"></span>
			</button>
		</div>

		<div class="footer">
			<p>Ten Text Twist</p>
			<p class="version">A daily word game</p>
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
		max-width: 380px;
		width: 100%;
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
		margin-bottom: 20px;
	}

	.setting-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12px 0;
		border-bottom: 1px solid var(--color-border);
	}

	.setting-info {
		display: flex;
		flex-direction: column;
	}

	.setting-label {
		font-size: 0.9rem;
		font-weight: 600;
	}

	.setting-desc {
		font-size: 0.75rem;
		color: var(--color-text-muted);
	}

	.toggle {
		width: 44px;
		height: 24px;
		border-radius: 12px;
		background: var(--color-tile-bg);
		position: relative;
		transition: background 0.2s;
		min-width: 44px;
	}

	.toggle.on {
		background: var(--color-correct);
	}

	.toggle-knob {
		position: absolute;
		top: 3px;
		left: 3px;
		width: 18px;
		height: 18px;
		border-radius: 50%;
		background: white;
		transition: transform 0.2s;
	}

	.toggle.on .toggle-knob {
		transform: translateX(20px);
	}

	.footer {
		text-align: center;
		margin-top: 24px;
		color: var(--color-text-muted);
		font-size: 0.8rem;
	}

	.version {
		font-size: 0.7rem;
	}
</style>
