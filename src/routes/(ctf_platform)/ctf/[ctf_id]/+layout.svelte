<script lang="ts">
	import '../../../../app.css';
	import Navbar from '$lib/components/navbar.svelte';
	let { children, data } = $props();
	let { user, translations, team } = data;
	import { page } from '$app/state';
	const links = [
		{ display: 'Wargames', href: '/challenges' },
		{ display: 'Challenges', href: `/ctf/${page.params.ctf_id}/challenges` },
		{ display: 'Leaderboard', href: `/ctf/${page.params.ctf_id}/scoreboard` },
		team === undefined
			? { display: 'Register Team', href: `/ctf/${page.params.ctf_id}/register_team` }
			: { display: 'Team', href: `/ctf/${page.params.ctf_id}/team/${team?.teamId}` }
	];
</script>

<Navbar {translations} {user} {links}></Navbar>
<main
	class="bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark flex min-h-[var(--main-height)] w-screen flex-col items-stretch py-[var(--nav-height)]"
>
	{@render children()}
</main>
