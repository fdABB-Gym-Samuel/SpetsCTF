<script lang="ts">
    import type { Challenges } from '$lib/generated/db';

    interface Props {
        challengeData: Selectable<Challenges> & { num_solvers?: number } & {
            solved?: boolean;
        };
        solveDate?: Date;
    }

    let { challengeData, solveDate }: Props = $props();

    import { map } from '$lib/utils/utils';
    import { categories } from '$lib/db/constants';
    import { capitalizeFirstLetter } from '$lib/utils/utils';
    import type { Selectable } from 'kysely';

    function getPointColor(points: number): string {
        const labA = Math.floor(map(points, 0, 500, -128, 128));
        return `lab(90% ${labA} 128)`;
    }

    let pointElement: HTMLSpanElement | undefined = $state(undefined);

    $effect(() => {
        if (pointElement && !challengeData.solved) {
            pointElement.style.color = getPointColor(challengeData.points);
        } else if (pointElement && challengeData.solved) {
            pointElement.style.backgroundColor = getPointColor(challengeData.points);
            pointElement.classList.add('text-bg-700');
        }
    });

    let filteredCategories = categories.filter(
        (_, index) =>
            challengeData.challenge_sub_categories.split('').reverse().join('')[
                index
            ] === '1'
    );

    let displayedCategories = filteredCategories.slice(0, 3);
    let extraCategoriesCount =
        filteredCategories.length > 3 ? filteredCategories.length - 3 : 0;

    $inspect('challengeData', challengeData);
    $inspect('points', challengeData.points);
    $inspect('num_solvers', challengeData.num_solvers);
</script>

<article
    class="card challenge-cards bg-bg-800 before:bg-bg-750 relative h-full min-h-fit max-w-full overflow-hidden rounded-lg px-10
  py-6 before:absolute before:inset-0 before:origin-center before:scale-0 before:rounded-lg before:transition-transform
  before:duration-500 before:ease-out before:content-[''] hover:before:scale-100"
    class:bg-gradient-to-br={challengeData.solved}
    class:from-primary={challengeData.solved}
    class:to-primary-light={challengeData.solved}>
    <div class="relative z-10 flex h-full flex-col justify-between">
        <section class="top *:flex *:items-center *:justify-between">
            <div class="flex !items-start justify-start">
                <h3 class="challenge-name text-[18px] font-bold">
                    {challengeData.display_name}
                </h3>
                <p class="mt-1 mb-0.5 font-mono text-xs">
                    {#if solveDate}
                        {solveDate.toLocaleDateString('sv-SE')}
                    {:else if challengeData.created_at}
                        {challengeData.created_at.toLocaleDateString('sv-SE')}
                    {/if}
                </p>
            </div>
            {#if challengeData.num_solvers}
                <div class="mt-2 mb-4">
                    <p class="font-mono text-sm font-bold">
                        {challengeData.num_solvers}&nbsp;&nbsp;<span
                            class="text-text-200"
                            class:!text-text-100={challengeData.solved}>
                            {#if challengeData.num_solvers == 1}
                                SOLVER
                            {:else}
                                SOLVERS
                            {/if}
                        </span>
                    </p>
                    <p class="font-mono text-sm font-bold">
                        <span class="mx-1 rounded-2xl bg-black" bind:this={pointElement}
                            >&nbsp;{challengeData.points}&nbsp;</span
                        ><span
                            class="text-text-200"
                            class:!text-text-100={challengeData.solved}>POINTS</span>
                    </p>
                </div>
            {/if}
        </section>
        <section class="justify arounditems-center flex">
            <ul class="categroies flex w-full flex-row flex-wrap">
                {#each displayedCategories as category, index (category)}
                    <li
                        class="text-text-100 px-4 py-1 text-xs
            {index === 0 ? 'bg-gradient-100 rounded-l-xl rounded-bl-xl' : ''}
            {index === 1 ? 'bg-gradient-200' : ''}
            {index === 2 ? 'bg-gradient-300 rounded-r-xl rounded-br-xl' : ''}
            {index === displayedCategories.length - 1
                            ? 'rounded-r-xl rounded-br-xl'
                            : ''}"
                        class:bg-text-100={challengeData.solved}
                        class:!text-gradient-100={index === 0 && challengeData.solved}
                        class:!text-gradient-200={index === 1 && challengeData.solved}
                        class:!text-gradient-300={index === 2 && challengeData.solved}>
                        # {capitalizeFirstLetter(category)}
                    </li>
                {/each}
            </ul>
            {#if extraCategoriesCount > 0}
                <div class="text-text-100 text-sm">
                    <span>+{extraCategoriesCount}</span>
                </div>
            {/if}
        </section>
    </div>
</article>
