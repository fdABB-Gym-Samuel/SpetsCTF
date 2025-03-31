<script lang="ts">
	import '../../app.css';
	import Navbar from '$lib/components/navbar.svelte';
	let { children, data } = $props();
	let { user, translations } = data;

	const links = [
		{ display: translations.challenges, href: '/challenges' },
		{ display: translations.ctfs, href: `/ctfs` },
		{ display: translations.leaderboard, href: `/scoreboard` },
		{ display: translations.about, href: `/about` },
		{ display: translations.users, href: `/users` }
	];
</script>

<Navbar {user} {translations} {links}></Navbar>

<main
	class="bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark flex min-h-[var(--main-height)] w-screen flex-col items-stretch py-[var(--nav-height)]"
>
	{@render children()}
</main>
