<script lang="ts">
    import { resolve } from '$app/paths';
    import ChallengeCard from '$lib/components/ChallengeCard.svelte';
    let { data } = $props();
    let translations = $derived(data.translations);
</script>

<div class="content flex flex-col gap-10">
    <h1 class="route-title">{data.userInfo?.displayName}</h1>

    <section>
        <h3>{translations.overview}</h3>

        <ol class="flex list-disc flex-col gap-1 px-8">
            <li>
                <a href="#ctfs"
                    >{translations.ctfs}
                    {data.userInfo?.displayName}
                    {translations.has_competed_in}</a>
            </li>
            <li>
                <a href="#solved"
                    >{translations.challenges}
                    {data.userInfo?.displayName}
                    {translations.has_solved.toLowerCase()}</a>
            </li>
            <li>
                <a href="#authored"
                    >{translations.challenges}
                    {data.userInfo?.displayName}
                    {translations.has_authored.toLowerCase()}</a>
            </li>
        </ol>
    </section>
    <section id="ctfs">
        <h3>{translations.competed_in}:</h3>
        <ul id="ctfs" class="flex flex-col">
            {#if data.userInfo && data.userInfo.ctfs}
                {#each data.userInfo?.ctfs as ctf, i (ctf.ctfId)}
                    <li
                        class="flex flex-row items-center justify-between border-b-1 py-2"
                        class:border-t-1={i % 2 === 0}>
                        <a class="w-full" href={resolve(`/ctf/${ctf.ctfId}`)}
                            >{ctf.ctfName}</a>
                        <div class="flex w-full flex-row justify-between gap-2">
                            <p>{translations.with}:</p>
                            <a href={resolve(`/ctf/${ctf.ctfId}/team/${ctf.teamId}`)}
                                >{ctf.teamName}</a>
                        </div>
                    </li>
                {/each}
            {/if}
        </ul>
    </section>
    <section id="solved">
        <h3>{translations.has_solved}:</h3>
        <ul class="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
            {#if data.userInfo && data.userInfo.solves}
                {#each data.userInfo.solves as solve (solve.id)}
                    <li>
                        <ChallengeCard data={{ challengeData: solve }}></ChallengeCard>
                    </li>
                {/each}
            {/if}
        </ul>
    </section>
    <section id="authored">
        <h3>{translations.has_authored}:</h3>
        <ul class="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
            {#if data.userInfo && data.userInfo?.authoredChallenges}
                {#each data.userInfo?.authoredChallenges as authoredChallenge (authoredChallenge.id)}
                    <li>
                        <ChallengeCard data={{ challengeData: authoredChallenge }}
                        ></ChallengeCard>
                    </li>
                {/each}
            {/if}
        </ul>
    </section>
</div>
