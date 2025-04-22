<script lang="ts">
	let { data } = $props();
	let { challenge_data } = data;

  import { capitalizeFirstLetter } from '$lib/utils/utils';

	let categories = [
		'crypto',
		'forensics',
		'introduction',
		'misc',
		'osint',
		'pwn',
		'reversing',
		'web'
	];

  function getPointColor(points: number): string {
    const colorRanges = [
      { min: 0, max: 199, class: 'text-point-100' },
      { min: 200, max: 299, class: 'text-point-200' },
      { min: 300, max: 399, class: 'text-point-300' },
      { min: 400, max: 499, class: 'text-point-400' },
      { min: 500, max: 599, class: 'text-point-500' },
    ];

    for (const range of colorRanges) {
      if (points >= range.min && points <= range.max) {
        return range.class;
      }
    }

    return 'text-text-100';
  }

  let filteredCategories = categories.filter((_, index) =>
		challenge_data.challenge_sub_categories
			.split('')
			.reverse()
			.join('')[index] === '1'
	);

  let displayedCategories = filteredCategories.slice(0, 3);

  let extraCategoriesCount = filteredCategories.length > 3
    ? filteredCategories.length - 3
    : 0;
</script>

<article
	class="card dark:bg-bg-800 overflow-hidden relative h-full min-h-46 min-w-108 w-full max-w-100 rounded-lg px-10 py-6
  before:content-[''] before:absolute before:inset-0 before:bg-bg-750 before:rounded-lg before:origin-center before:scale-0
  before:transition-transform before:duration-500 before:ease-out hover:before:scale-100"
	class:dark:bg-challenge-solved-dark={challenge_data.solved}
	class:bg-challenge-solved-light={challenge_data.solved}
>
  <div class="relative flex flex-col justify-between h-full z-10">
    <section class="top *:flex *:justify-between *:items-center">
      <div>
        <h3
          class="challenge-name text-[18px] font-bold"
          class:dark:text-background-dark={challenge_data.solved}
          class:text-background-light={challenge_data.solved}
        >
          {challenge_data.challenge_name}
        </h3>
        <!-- TODO: add field for date -->
        <p class="font-mono mb-0.5 text-xs font-bold">2025-03-04</p>
      </div>
      <div class="mt-2">
        <p class="font-mono text-sm font-bold">{challenge_data.num_solves}&nbsp;&nbsp;<span class="text-text-200">SOLVERS</span></p>
        <p class="font-mono text-sm font-bold {getPointColor(challenge_data.points)}">{challenge_data.points}&nbsp;&nbsp;<span class="text-text-200">POINTS</span></p>
      </div>
    </section>
    <section class="flex items-center">
      <ul class="categroies flex w-full flex-row flex-wrap">
        {#each displayedCategories as category, index}
          <li
            class="text-text-100 px-7 py-1 text-xs
            {index === 0 ? "bg-gradient-100 rounded-l-xl rounded-bl-xl" : ""}
            {index === 1 ? "bg-gradient-200" : ""}
            {index === 2 ? "bg-gradient-300 rounded-r-xl rounded-br-xl" : ""}"
          >
            <p># {capitalizeFirstLetter(category)}</p>
          </li>
        {/each}
      </ul>
      {#if extraCategoriesCount > 0}
        <li class="text-text-100 text-sm">
          <p>+{extraCategoriesCount}</p>
        </li>
      {/if}
    </section>
  </div>

	<!-- <section class="bottom flex flex-col justify-between">
		<div class="author-wrapper"></div>
		<div class="solution-stats flex flex-row justify-between text-sm">
			{#if challenge_data.num_solves}
				<div class="flex flex-row items-center gap-0.5">
					<Flag class="size-4"></Flag>
					<p
						class="num-solves text-background-light dark:text-background-dark"
						class:dark:text-background-dark={challenge_data.solved}
						class:text-background-light={challenge_data.solved}
					>
						{challenge_data.num_solves}
					</p>
				</div>
			{/if}
			<div class="flex flex-row items-center gap-0.5">
				<CirclePlus class="size-4"></CirclePlus>
				<p
					class="point-reward text-background-light dark:text-background-dark align-text-middle"
					class:dark:text-background-dark={challenge_data.solved}
					class:text-background-light={challenge_data.solved}
				>
					{challenge_data.points}
				</p>
			</div>
		</div>
	</section> -->
</article>
