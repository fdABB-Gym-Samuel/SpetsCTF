<script lang="ts">
    import '../app.css';
    import { resolve } from '$app/paths';
    import Navbar from '$lib/components/Navbar.svelte';
    let { children, data } = $props();

    let user = $derived(data.user);
    let translations = $derived(data.translations);

    let links = $derived([
        { display: translations.challenges, href: resolve('/challenges') },
        { display: translations.ctfs, href: resolve('/ctfs') },
        { display: translations.leaderboard, href: resolve('/leaderboard') },
    ]);
</script>

<Navbar {user} {translations} {links}></Navbar>

{@render children()}
