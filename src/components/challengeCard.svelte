<script lang="ts">
    export let challenge_data;
    console.log(challenge_data)


</script>

<!-- <main class="card flex flex-col justify-between bg-button-dark h-[var(--challenge-card-height)] w-[var(--challenge-card-width)] rounded-[var(--card-radius)] px-4 py-2"> -->
<main class="card flex flex-col justify-between bg-button-dark h-full min-h-fit w-full rounded-[var(--card-radius)] px-4 py-2">
        <section class="top h-fit">
            <h5 class="challenge-name text-2xl">{challenge_data.name}</h5>
            <ul class="categroies flex flex-row flex-wrap w-full">
                {#each challenge_data.sub_categories as category}
                <li class="text-xs bg-foreground-dark text-background-dark px-1 py-0.5 mr-1.5 mt-1 rounded-md">{category}</li>
                {/each}
            </ul>
        </section>
        <section class="bottom flex flex-col justify-between">
            <div class="author-wrapper">
                <p class="author mb-2 text-sm"><i class="fa-solid fa-pen"></i> {challenge_data.author}</p>
            </div>
            <div class="solution-stats flex flex-row justify-between text-sm">
                <p class="num-solves"># {challenge_data.num_solves}</p>
                <p class="point-reward"><i class="fa-solid fa-circle-plus"></i> {challenge_data.points}</p>
            </div>
        </section>

    
</main>
