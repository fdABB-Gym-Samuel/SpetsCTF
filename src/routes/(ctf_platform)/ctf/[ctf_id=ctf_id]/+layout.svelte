<script lang="ts">
	import { resolve } from "$app/paths";
	import Navbar from '$lib/components/Navbar.svelte';
	let { children, data } = $props();

	import { page } from '$app/state';

	let links = $derived([
		{ display: data.translations.wargames, href: resolve('/challenges') },
		{ display: data.translations.challenges, href: resolve(`/ctf/${page.params.ctf_id}/challenges`) },
		{ display: data.translations.leaderboard, href: resolve(`/ctf/${page.params.ctf_id}/leaderboard`) },
		data.isOrg === false
			? data.team === undefined
				? { display: data.translations.register_team, href: resolve(`/ctf/${page.params.ctf_id}/register_team`) }
				: { display: data.translations.team, href: resolve(`/ctf/${page.params.ctf_id}/team/${data.team?.teamId}`) }
			: { display: 'Organizer', href: resolve(`/ctf/${page.params.ctf_id}/organizer`) }
	]);
</script>

<Navbar {data.user} {data.translations} {links}></Navbar>

<main>
	{@render children()}
</main>
