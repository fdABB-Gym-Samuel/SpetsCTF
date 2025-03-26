<script lang="ts">
	import '../../app.css';
	import Navbar from '$lib/components/navbar.svelte';
	let { children, data, page} = $props();
	let { user, translations } = data;

	const links = [
		{display: "Challenges", href:"/challenges"},
		{display: "CTFs", href:`/ctfs`},
		{display: "Leaderboard", href:`/scoreboard`},
		{display: "About", href:`/about`},

	]
</script>

<Navbar {user} {translations} {links}></Navbar>

<main
	class="bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark flex min-h-[var(--main-height)] w-screen flex-col items-stretch py-[var(--nav-height)]"
>
	{@render children()}
</main>
