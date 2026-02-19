import { load, save } from './persistence.js';

const saved = load('settings', { theme: 'dark', mode: 'untimed' });

let theme = $state(saved.theme || 'dark');
let mode = $state(saved.mode || 'untimed');

$effect.root(() => {
	$effect(() => {
		save('settings', { theme, mode });
		if (typeof document !== 'undefined') {
			document.documentElement.setAttribute('data-theme', theme);
		}
	});
});

export const settings = {
	get theme() { return theme; },
	set theme(v) { theme = v; },
	get mode() { return mode; },
	set mode(v) { mode = v; },
	toggleTheme() {
		theme = theme === 'dark' ? 'light' : 'dark';
	}
};
