<script lang="ts">
    import { resolve } from '$app/paths';
    import Navbar from '$lib/components/Navbar.svelte';
    let { children, data } = $props();

    import { page } from '$app/state';

    let links = $derived([
        { display: data.translations.wargames, href: resolve('/challenges') },
        {
            display: data.translations.challenges,
            href: resolve(`/ctf/${page.params.ctfId}/challenges`),
        },
        {
            display: data.translations.leaderboard,
            href: resolve(`/ctf/${page.params.ctfId}/leaderboard`),
        },
        data.isOrg !== true
            ? data.team === undefined || data.team === null
                ? {
                      display: data.translations.register_team,
                      href: resolve(`/ctf/${page.params.ctfId}/register_team`),
                  }
                : {
                      display: data.translations.team,
                      href: resolve(
                          `/ctf/${page.params.ctfId}/team/${data.team?.teamId}`
                      ),
                  }
            : {
                  display: 'Organizer',
                  href: resolve(`/ctf/${page.params.ctfId}/organizer`),
              },
    ]);
</script>

<Navbar user={data.user} translations={data.translations} {links}></Navbar>

<main>
    {@render children()}
</main>
