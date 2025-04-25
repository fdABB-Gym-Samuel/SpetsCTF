<script lang="ts">
	let { data } = $props();
	let { challenge_data } = data;
	import { map } from '$lib/utils/utils';
	import { categories } from '$lib/db/constants';
	import { capitalizeFirstLetter } from '$lib/utils/utils';

	function getPointColor(points: number): string {
		const lab_a = Math.floor(map(points, 0, 500, -128, 128));
		return `lab(90% ${lab_a} 128)`;
	}
	let pointElement: HTMLElement;
	$effect(() => {
		if (pointElement) {
			pointElement.style.color = getPointColor(challenge_data.points);
		}
	});

	let filteredCategories = categories.filter(
		(_, index) =>
			challenge_data.challenge_sub_categories.split('').reverse().join('')[index] === '1'
	);

	let displayedCategories = filteredCategories.slice(0, 3);

	let extraCategoriesCount = filteredCategories.length > 3 ? filteredCategories.length - 3 : 0;
</script>

<article
	class="card dark:bg-bg-800 before:bg-bg-750 relative h-full min-h-46 w-full max-w-100 min-w-108 overflow-hidden rounded-lg px-10
  py-6 before:absolute before:inset-0 before:origin-center before:scale-0 before:rounded-lg before:transition-transform
  before:duration-500 before:ease-out before:content-[''] hover:before:scale-100"
>
	<div class="relative z-10 flex h-full flex-col justify-between">
		<section class="top *:flex *:items-center *:justify-between">
			<div>
				<h3 class="challenge-name text-[18px] font-bold">
					{challenge_data.challenge_name}
				</h3>
				<!-- TODO: add field for date -->
				<p class="mb-0.5 font-mono text-xs font-bold">2025-03-04</p>
			</div>
			<div class="mt-2">
				<p class="font-mono text-sm font-bold">
					{challenge_data.num_solves}&nbsp;&nbsp;<span class="text-text-200">SOLVERS</span>
				</p>
				<p class="font-mono text-sm font-bold" bind:this={pointElement}>
					{challenge_data.points}&nbsp;&nbsp;<span class="text-text-200">POINTS</span>
				</p>
			</div>
		</section>
		<section class="justify arounditems-center flex">
			<ul class="categroies flex w-full flex-row flex-wrap">
				{#each displayedCategories as category, index}
					<li
						class="text-text-100 px-4 py-1 text-xs
            {index === 0 ? 'bg-gradient-100 rounded-l-xl rounded-bl-xl' : ''}
            {index === 1 ? 'bg-gradient-200' : ''}
            {index === 2 ? 'bg-gradient-300 rounded-r-xl rounded-br-xl' : ''}
            {index === displayedCategories.length - 1 ? 'rounded-r-xl rounded-br-xl' : ''}"
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
