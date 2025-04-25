<script lang="ts">
	import '../../app.css';
	import Navbar from '$lib/components/Navbar.svelte';
	let { children, data } = $props();
	let { user, translations } = data;

	const links = [
		{ display: translations.challenges, href: '/challenges' },
		{ display: translations.ctfs, href: `/ctfs` },
		{ display: translations.leaderboard, href: `/leaderboard` },
		{ display: translations.users, href: `/users` }
	];
</script>

<Navbar {user} {translations} {links}></Navbar>

<main>
	{@render children()}
</main>
