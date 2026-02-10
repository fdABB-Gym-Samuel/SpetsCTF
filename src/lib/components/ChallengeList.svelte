<script lang="ts">
    import ChallengeCard from './ChallengeCard.svelte';
    // import VSeperator from "./VSeperator.svelte";
    import type { Challenges } from '$lib/generated/db';
    import type { Selectable } from 'kysely';
    import { capitalizeFirstLetter } from '$lib/utils/utils';
    import { categories } from '$lib/db/constants';
    import IconCaretDownBold from 'phosphor-icons-svelte/IconCaretDownBold.svelte';
    import { slide } from 'svelte/transition';

    interface Props {
        challenges: (Omit<Selectable<Challenges>, 'flag' | 'migrate_to_wargames'> & {
            num_solvers: number;
        } & {
            solved: boolean;
        })[];
        gotoChallenge: (challengeId: string) => void;
        showSolved?: boolean;
        showCategory?: string;
        searchQuery?: string;
    }

    let {
        challenges,
        gotoChallenge,
        showSolved = $bindable(true),
        showCategory = $bindable(''),
        searchQuery = $bindable(''),
    }: Props = $props();

    // Track expanded state for each category (all expanded by default)
    let expandedCategories = $state<Record<string, boolean>>(
        Object.fromEntries(categories.map((cat) => [cat, true]))
    );

    let challengesByCategory = $derived(
        Object.groupBy(
            challenges,
            (challenge) =>
                challenge.challenge_category?.toLowerCase() ?? 'uncategorized'
        )
    );

    function toggleCategory(category: string) {
        expandedCategories[category] = !expandedCategories[category];
    }
</script>

<section class="w-full">
    {#each showCategory ? [showCategory] : categories as category (category)}
        <div class="mb-16" id={category}>
            <button
                class="mb-4 cursor-pointer pb-2 text-left"
                onclick={() => toggleCategory(category)}>
                <h3 class="flex items-center gap-2 text-[20px] font-semibold">
                    {capitalizeFirstLetter(category)}
                    <div
                        class="transition-transform"
                        style="transform: rotate({expandedCategories[category]
                            ? '0deg'
                            : '180deg'})">
                        <IconCaretDownBold class="text-text-200 " />
                    </div>
                </h3>
            </button>

            {#if expandedCategories[category]}
                <div transition:slide={{ duration: 300 }}>
                    {#if challengesByCategory[category]}
                        {#if challengesByCategory[category]?.filter((challenge) => !challenge?.solved).length <= 0 && showSolved === false}
                            <p class="mb-4">No unsolved challenges</p>
                        {:else if challengesByCategory[category]?.length > 0}
                            <ul
                                class="grid grid-cols-[repeat(auto-fill,minmax(305px,1fr))] gap-6 sm:grid-cols-[repeat(auto-fill,minmax(350px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(390px,1fr))]">
                                {#each challengesByCategory[category] as challengeData (challengeData.challenge_id)}
                                    {#if (!challengeData.solved || showSolved) && challengeData.display_name
                                            .toLowerCase()
                                            .includes(searchQuery?.toLowerCase() ?? '')}
                                        <li class="min-h-fit min-w-65">
                                            <button
                                                class="w-full hover:cursor-pointer"
                                                onclick={() =>
                                                    gotoChallenge(
                                                        challengeData.challenge_id
                                                    )}>
                                                <ChallengeCard {challengeData}
                                                ></ChallengeCard>
                                            </button>
                                        </li>
                                    {/if}
                                {/each}
                            </ul>
                        {:else}
                            <p class="mb-4">No challenges yet</p>
                        {/if}
                    {/if}
                </div>
            {/if}

            <!-- <VSeperator /> -->
        </div>
    {/each}
</section>
