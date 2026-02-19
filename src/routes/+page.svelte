<script>
	import { untrack } from 'svelte';
	import { game } from '$lib/state/game.svelte.js';
	import { gameStats } from '$lib/state/stats.svelte.js';
	import { settings } from '$lib/state/settings.svelte.js';
	import Header from '$lib/components/Header.svelte';
	import Game from '$lib/components/Game.svelte';
	import ModeSelect from '$lib/components/ModeSelect.svelte';
	import ResultsModal from '$lib/components/ResultsModal.svelte';
	import StatsModal from '$lib/components/StatsModal.svelte';
	import SettingsModal from '$lib/components/SettingsModal.svelte';
	import HelpModal from '$lib/components/HelpModal.svelte';

	let { data } = $props();

	let showResults = $state(false);
	let showStats = $state(false);
	let showSettings = $state(false);
	let showHelp = $state(false);
	let initialized = $state(false);

	// On mount, check for saved progress (runs once)
	$effect(() => {
		if (initialized) return;
		if (data.puzzle) {
			initialized = true;
			untrack(() => {
				const progress = game.getProgress(data.puzzleNumber);
				if (progress) {
					game.restoreGame(data.puzzle, progress);
					if (progress.phase === 'finished') {
						showResults = true;
					}
				}
			});
		}
	});

	function handleStart(timed) {
		if (!data.puzzle) return;
		game.startGame(data.puzzle, timed);
	}

	function handleFinish() {
		// Record stats
		gameStats.recordGame({
			puzzleNumber: game.puzzleNumber,
			solved: game.solvedCount,
			timeMs: game.timed ? game.elapsed : undefined
		});
		showResults = true;
	}
</script>

<div class="app">
	<Header
		onSettings={() => showSettings = true}
		onStats={() => showStats = true}
		onHelp={() => showHelp = true}
	/>

	<main class="content">
		{#if data.error}
			<div class="error">
				<p>{data.error}</p>
				<p>Please check back later.</p>
			</div>
		{:else if game.phase === 'idle'}
			<ModeSelect
				puzzleNumber={data.puzzleNumber}
				onStart={handleStart}
			/>
		{:else}
			<Game onFinish={handleFinish} />
		{/if}
	</main>
</div>

{#if showResults}
	<ResultsModal
		onClose={() => showResults = false}
		onViewStats={() => { showResults = false; showStats = true; }}
	/>
{/if}

{#if showStats}
	<StatsModal onClose={() => showStats = false} />
{/if}

{#if showSettings}
	<SettingsModal onClose={() => showSettings = false} />
{/if}

{#if showHelp}
	<HelpModal onClose={() => showHelp = false} />
{/if}

<style>
	.app {
		display: flex;
		flex-direction: column;
		height: 100vh;
		height: 100dvh;
	}

	.content {
		flex: 1;
		overflow: hidden;
	}

	.error {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		text-align: center;
		color: var(--color-text-muted);
		gap: 8px;
	}
</style>
