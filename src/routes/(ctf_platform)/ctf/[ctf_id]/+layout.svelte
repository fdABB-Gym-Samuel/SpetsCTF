<script lang="ts">
    import "../../../../app.css";
    import Navbar from '$lib/components/navbar.svelte';
    let { children, data } = $props();
	let { user, translations } = data;
	import { page } from '$app/state';
    const links = [
		{display: "Wargames", href:"/challenges"},
		{display: "Challenges", href:`/ctf/${page.params.ctf_id}/challenges`},
		{display: "Leaderboard", href:`/ctf/${page.params.ctf_id}/scoreboard`},
	]
</script>

<Navbar {translations} {user} {links}>

</Navbar>
<main>
    {@render children()}
</main>