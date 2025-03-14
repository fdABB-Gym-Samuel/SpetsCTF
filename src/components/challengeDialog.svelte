<script lang="ts">
    export let challenge_name:string;
    export let challenge_description:string;
    export let challenge_rescources:string[];
    export let author:string;
    export let points:number;
    export let num_solves:number;
    export let categories:string[];
</script>

<dialog class="flex flex-col h-[var(--challenge-dialog-height) w-[var(--challenge-dialog-height)]" >
    <section class="top">
        <h3 class="challenge-title">{challenge_name}</h3>
        <ul class="categroies flex flex-row flex-wrap w-full">
            {#each categories as category}
            <li class="text-xs bg-foreground-dark text-background-dark px-1 py-0.5 mr-1.5 mt-1 rounded-md">{category}</li>
            {/each}
        </ul>
    </section>
</dialog>