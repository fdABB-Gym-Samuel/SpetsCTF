<script lang="ts">
    import { resolve } from '$app/paths';
    import ChallengeCard from '$lib/components/ChallengeCard.svelte';
    let { data } = $props();

    let authoredChallenges = $derived(data.authoredChallenges);
    let participatedCtfs = $derived(data.participatedCtfs);
    let solvedChallenges = $derived(data.solvedChallenges);
    let translations = $derived(data.translations);
    let userInfo = $derived(data.userInfo);

    let displayName = $derived(userInfo.display_name);
</script>

<div class="content mt-16 flex flex-col gap-8">
    <h1 class="route-title text-xl font-bold">{displayName}</h1>

    <section>
        <h3 class="text-lg font-bold">{translations.competed_in}</h3>
        <ul id="ctfs" class="flex flex-col">
            {#if userInfo && participatedCtfs.length > 0}
                {#each participatedCtfs as ctf, i (ctf.id)}
                    <li
                        class="flex flex-row items-center justify-between border-b-1 py-2"
                        class:border-t-1={i % 2 === 0}>
                        <a class="w-full" href={resolve(`/ctf/${ctf.id}`)}
                            >{ctf.display_name}</a>
                        <div class="flex w-full flex-row justify-between gap-2">
                            <p>{translations.with}</p>
                            <a href={resolve(`/ctf/${ctf.id}/team/${ctf.team.id}`)}
                                >{ctf.team.name}</a>
                        </div>
                    </li>
                {/each}
            {:else}
                <span>{translations.no_ctfs_yet}</span>
            {/if}
        </ul>
    </section>
    <section>
        <h3 class="text-lg font-bold">{translations.has_solved}</h3>
        <ul class="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
            {#if solvedChallenges.length > 0}
                {#each solvedChallenges as solve (solve.challenge_id)}
                    <li>
                        <ChallengeCard
                            solveDate={new Date(solve.solve_time)}
                            challengeData={solve}></ChallengeCard>
                    </li>
                {/each}
            {:else}
                <span>{translations.no_solves_yet}</span>
            {/if}
        </ul>
    </section>
    <section>
        <h3 class="text-lg font-bold">{translations.has_authored}</h3>
        <ul class="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
            {#if authoredChallenges.length > 0}
                {#each authoredChallenges as authoredChallenge (authoredChallenge.challenge_id)}
                    <li>
                        <ChallengeCard challengeData={authoredChallenge}
                        ></ChallengeCard>
                    </li>
                {/each}
            {:else}
                <span>{translations.no_authored_challenges_yet}</span>
            {/if}
        </ul>
    </section>
</div>
