<script lang="ts">
	import { resolve } from "$app/paths";
	import Navbar from '$lib/components/Navbar.svelte';
	let { children, data } = $props();
	let { user, translations } = data;

	const links = [
		{ display: translations.challenges, href: resolve('/challenges') },
		{ display: translations.ctfs, href: resolve('/ctfs') },
		{ display: translations.leaderboard, href: resolve('/leaderboard') }
	];
</script>

<Navbar {user} {translations} {links}></Navbar>

<main>
	{@render children()}
</main>
