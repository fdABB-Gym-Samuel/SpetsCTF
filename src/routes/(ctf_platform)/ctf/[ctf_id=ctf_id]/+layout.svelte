<script lang="ts">
	import '../../../../app.css';
	import Navbar from '$lib/components/Navbar.svelte';
	let { children, data } = $props();
	let { user, translations, team, isOrg } = data;
	import { page } from '$app/state';
	const links = [
		{ display: translations.wargames, href: '/challenges' },
		{ display: translations.challenges, href: `/ctf/${page.params.ctf_id}/challenges` },
		{ display: translations.leaderboard, href: `/ctf/${page.params.ctf_id}/scoreboard` },
		isOrg === false
			? team === undefined
				? { display: translations.register_team, href: `/ctf/${page.params.ctf_id}/register_team` }
				: { display: translations.team, href: `/ctf/${page.params.ctf_id}/team/${team?.teamId}` }
			: { display: 'Organizer', href: `/ctf/${page.params.ctf_id}/organizer` }
	];
</script>

<Navbar {user} {translations} {links}></Navbar>

<main>
	{@render children()}
</main>
