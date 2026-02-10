<script lang="ts">
    import type { Challenges } from '$lib/generated/db';

    interface Props {
        challengeData: Selectable<Challenges> & { num_solvers?: number } & {
            solved?: boolean;
        };
        solveDate?: Date;
    }

    let { challengeData, solveDate }: Props = $props();

    // import { map } from '$lib/utils/utils';
    import { categories } from '$lib/db/constants';
    import { capitalizeFirstLetter } from '$lib/utils/utils';
    import type { Selectable } from 'kysely';

    import { getPointBracket } from '$lib/utils/utils';

    let pointBracket = $derived(getPointBracket(challengeData.points));

    let filteredCategories = categories.filter(
        (_, index) =>
            challengeData.challenge_sub_categories.split('').reverse().join('')[
                index
            ] === '1'
    );

    let displayedCategories = filteredCategories.slice(0, 3);
    let extraCategoriesCount =
        filteredCategories.length > 3 ? filteredCategories.length - 3 : 0;
</script>

<article
    class="bg-card hover:bg-bg-700 relative h-full min-h-fit max-w-full overflow-hidden rounded-[10px] px-8 py-6 transition-colors"
    class:bg-gradient-to-br={challengeData.solved}
    class:from-primary={challengeData.solved}
    class:to-primary-light={challengeData.solved}>
    <div class="relative z-10 flex h-full flex-col justify-between">
        <section>
            <div class="flex justify-between">
                <h3 class="challenge-name text-left text-[18px]">
                    {challengeData.display_name}
                </h3>
                <p
                    class:text-text-100={challengeData.solved}
                    class:text-text-200={!challengeData.solved}
                    class="font-mono text-sm font-semibold">
                    {#if solveDate}
                        {solveDate.toLocaleDateString('sv-SE')}
                    {:else if challengeData.created_at}
                        {challengeData.created_at.toLocaleDateString('sv-SE')}
                    {/if}
                </p>
            </div>
            {#if challengeData.num_solvers}
                <div class="mt-1 mb-6 flex items-start gap-5">
                    <p class="font-mono text-sm leading-normal font-semibold">
                        <span
                            class:text-text-100={challengeData.solved}
                            class:text-point-100={!challengeData.solved &&
                                pointBracket === 100}
                            class:text-point-200={!challengeData.solved &&
                                pointBracket === 200}
                            class:text-point-300={!challengeData.solved &&
                                pointBracket === 300}
                            class:text-point-400={!challengeData.solved &&
                                pointBracket === 400}
                            class:text-point-500={!challengeData.solved &&
                                pointBracket === 500}>{challengeData.points}</span
                        ><span
                            class="text-text-150"
                            class:text-text-100!={challengeData.solved}
                            >&nbsp;POINTS</span>
                    </p>
                    <p class="font-mono text-sm">
                        {challengeData.num_solvers}&nbsp;<span
                            class="text-text-150"
                            class:text-text-100!={challengeData.solved}>
                            {#if challengeData.num_solvers == 1}
                                SOLVE
                            {:else}
                                SOLVES
                            {/if}
                        </span>
                    </p>
                </div>
            {/if}
        </section>
        <section class="justify arounditems-center flex">
            <ul class="categroies flex w-full flex-row flex-wrap gap-2.5">
                {#each displayedCategories as category (category)}
                    <li
                        class:text-text-200={!challengeData.solved}
                        class:text-text-100={challengeData.solved}
                        class="text-sm">
                        # {capitalizeFirstLetter(category)}
                    </li>
                {/each}
            </ul>
            {#if extraCategoriesCount > 0}
                <div class="text-text-100">
                    <span>+{extraCategoriesCount}</span>
                </div>
            {/if}
        </section>
    </div>
</article>
