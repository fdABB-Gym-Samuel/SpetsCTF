<script lang="ts">
    export let challenge_name:string;
    export let challenge_description:string;
    export let challenge_rescources:string[];
    export let author:string;
    export let points:number;
    export let num_solves:number;
    export let categories:string[];
</script>

<!-- <main class="card flex flex-col justify-between bg-button-dark h-[var(--challenge-card-height)] w-[var(--challenge-card-width)] rounded-[var(--card-radius)] px-4 py-2"> -->
<main class="card flex flex-col justify-between bg-button-dark h-40 w-[var(--challenge-card-width)] rounded-[var(--card-radius)] px-4 py-2">
    <!-- <div class="card"> -->
        <section class="top">
            <h5 class="challenge-name text-2xl">{challenge_name}</h5>
            <ul class="categroies flex flex-row flex-wrap w-full">
                {#each categories as category}
                <li class="text-xs bg-foreground-dark text-background-dark px-1 py-0.5 mr-1.5 mt-1 rounded-md">{category}</li>
                {/each}
            </ul>
        </section>
        <section class="bottom flex flex-col justify-between h-4/10">
            <div class="author-wrapper">
                <p class="author"><i class="fa-solid fa-pen"></i> {author}</p>
            </div>
            <div class="solution-stats flex flex-row justify-between">
                <p class="num-solves"># {num_solves}</p>
                <p class="point-reward"><i class="fa-solid fa-circle-plus"></i> {points}</p>
            </div>
        </section>
        <!-- <div class="challenge-body flex flex-row">
            <p class="challenge-desc">{challenge_description}</p>
            <ul class="challenge-res">
                {#each challenge_rescources as resc}
                    <li class="challenge-resource">{resc}</li>
                {/each}
            </ul>ources
        </div> -->

    <!-- </div> -->
    
</main>
