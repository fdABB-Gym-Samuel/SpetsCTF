<script lang="ts">
	// export let challenge_data;
	let { data } = $props();
	let { challenge_data } = data;
</script>

<!-- <main class="card flex flex-col justify-between bg-button-dark h-[var(--challenge-card-height)] w-[var(--challenge-card-width)] rounded-[var(--card-radius)] px-4 py-2"> -->
<main
	class="card bg-button-light dark:bg-button-dark flex h-full min-h-fit w-full flex-col justify-between rounded-[var(--card-radius)] px-4 py-2"
	class:dark:bg-challenge-solved-dark={challenge_data.solved}
	class:bg-challenge-solved-light={challenge_data.solved}

>
	<section class="top h-fit">
		<h5 
			class="challenge-name text-2xl text-background-light dark:text-background-dark"
			class:dark:text-background-dark={challenge_data.solved}
			class:text-background-light={challenge_data.solved}
			>{challenge_data.challenge_name}</h5>
		<ul class="categroies flex w-full flex-row flex-wrap">
			{#each [challenge_data.challenge_category] as category}
				<li
					class="bg-foreground-dark text-background-dark mt-1 mr-1.5 rounded-md px-1 py-0.5 text-xs"
					>
					{category}
				</li>
			{/each}
		</ul>
	</section>
	<section class="bottom flex flex-col justify-between">
		<div class="author-wrapper">
			<!-- <p class="author mb-2 text-sm"><i class="fa-solid fa-pen"></i> {challenge_data.author}</p> -->
		</div>
		<div class="solution-stats flex flex-row justify-between text-sm">
			<p 
				class="num-solves text-background-light dark:text-background-dark"
				class:dark:text-background-dark={challenge_data.solved}
				class:text-background-light={challenge_data.solved}
				># {challenge_data.num_solves}</p>
			<p 
				class="point-reward text-background-light dark:text-background-dark"
				class:dark:text-background-dark={challenge_data.solved}
				class:text-background-light={challenge_data.solved}
				><i class="fa-solid fa-circle-plus"></i> {challenge_data.points}</p>
		</div>
	</section>
</main>
