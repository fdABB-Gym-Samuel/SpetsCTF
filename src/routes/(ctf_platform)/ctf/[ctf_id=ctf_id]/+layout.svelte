<script lang="ts">
	import { resolve } from "$app/paths";
	import Navbar from '$lib/components/Navbar.svelte';
	let { children, data } = $props();
	let { user, translations, team, isOrg } = data;
	import { page } from '$app/state';
	const links = [
		{ display: translations.wargames, href: resolve('/challenges') },
		{ display: translations.challenges, href: resolve(`/ctf/${page.params.ctf_id}/challenges`) },
		{ display: translations.leaderboard, href: resolve(`/ctf/${page.params.ctf_id}/leaderboard`) },
		isOrg === false
			? team === undefined
				? { display: translations.register_team, href: resolve(`/ctf/${page.params.ctf_id}/register_team`) }
				: { display: translations.team, href: resolve(`/ctf/${page.params.ctf_id}/team/${team?.teamId}`) }
			: { display: 'Organizer', href: resolve(`/ctf/${page.params.ctf_id}/organizer`) }
	];
</script>

<Navbar {user} {translations} {links}></Navbar>

<main>
	{@render children()}
</main>
