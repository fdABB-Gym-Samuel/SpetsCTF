<script lang="ts">
	import '../../app.css';
	import Navbar from '$lib/components/Navbar.svelte';
	let { children, data } = $props();
	let { user, translations } = data;

	import {PUBLIC_VERSION_STRING} from '$env/static/public';

	const links = [
		{ display: translations.challenges, href: '/challenges' },
		{ display: translations.ctfs, href: `/ctfs` },
		{ display: translations.leaderboard, href: `/leaderboard` }
	];
</script>

<Navbar {user} {translations} {links}></Navbar>

<main>
	{@render children()}
</main>

<footer>
	SpetsCTF Version {VERSION_STRING}
</footer>
