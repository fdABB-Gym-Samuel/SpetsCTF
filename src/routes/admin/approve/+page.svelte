<script lang="ts">
    import { resolve } from '$app/paths';
    import { page } from '$app/state';
    import ChallengeCard from '$lib/components/ChallengeCard.svelte';

    let { data } = $props();
    let unapprovedChallenges = $derived(data.unapprovedChallenges);
</script>

<div class="content">
    {#if page.url.searchParams.get('status') === 'approved'}
        <div class="mb-4">
            <h3 class="text-green-600">Challenge successfully approved</h3>
        </div>
    {/if}
    <div class="mb-4">
        <h1 class="route-title text-4xl">Approve Challenges</h1>
    </div>
    <ul
        class="grid grid-cols-[repeat(auto-fill,minmax(305px,1fr))] gap-4 sm:grid-cols-[repeat(auto-fill,minmax(350px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(390px,1fr))]">
        {#if unapprovedChallenges.length > 0}
            {#each unapprovedChallenges as challenge (challenge.challenge_id)}
                <li>
                    <a
                        href={resolve(`/challenges/${challenge.challenge_id}/edit`)}
                        data-sveltekit-noscroll
                        class="ignore-default h-38 w-full"
                        ><ChallengeCard challengeData={challenge}></ChallengeCard></a>
                </li>
            {/each}
        {:else}
            No challenges to approve.
        {/if}
    </ul>
</div>
