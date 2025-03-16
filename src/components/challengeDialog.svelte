<script lang="ts">
    import type { resource, Challenge_data } from "../types"
    export let challenge_data: Challenge_data = {
        name: "Not Found",  
        id: "1", 
        description: "",
        resources: [],
        author: "",
        points: 0,
        num_solves: 0,
        main_category: "",
        sub_categories: [],
        first_solvers: []
    };
    export let show_challenge_dialog:boolean = false;
    let show_copied_message = false
    console.log(show_challenge_dialog)

    async function copyToClipboard(text_to_copy:string) {
        try {
            await navigator.clipboard.writeText(text_to_copy)
                .then(() => {
                    show_copied_message = true;
                    setTimeout(() => {
                        show_copied_message = false; // Hide the speech bubble after 2 seconds
                    }, 1000);
                })
        } catch (err) {
          console.error("Failed to copy!", err);
        }
    }
    // show_challenge_dialog = false

</script>

{#if show_challenge_dialog}

<div on:click|self on:keydown|self role=button tabindex="0" class="backdrop flex justify-center items-center bg-backdrop fixed top-0 h-screen w-screen">
    <dialog class="flex flex-col items-center relative gap-5 max-h-[calc(100vh-40px)] min-h-[var(--challenge-dialog-height)] w-[var(--challenge-dialog-width)] m-auto rounded-md bg-button-dark px-[var(--challenge-padding-inline)] py-2 pb-15">
        <section class="top flex flex-col items-center w-full">
            <h3 class="challenge-title text-5xl text-foreground-dark pt-5 pb-2">{challenge_data.name}</h3>
            <ul class="categroies flex flex-row justify-center flex-wrap w-8/10">
                {#each [challenge_data.main_category, ...challenge_data.sub_categories] as category}
                <li class="text-xs bg-foreground-dark text-background-dark px-2 py-1 mr-1.5 mt-1 rounded-md">{category}</li>
                {/each}
            </ul>
            <div class="solve-stats flex flex-row text-foreground-dark gap-5 mt-1">
                <p class="points"><i class="fa-solid fa-circle-plus"></i> {challenge_data.points}</p>
                <p class="num-solves"><i class="fa-solid fa-flag"></i> {challenge_data.num_solves}</p>
            </div>
        </section>
        <section class="middle flex flex-row text-foreground-dark justify-between gap-4 h-full w-full overflow-hidden">
            <p class="challenge-description w-full overflow-scroll max-h-full">{challenge_data.description}</p>
            <div class="right flex flex-col w-full gap-3">
                <ul class="resources">
                    {#each challenge_data.resources as resource}
                    {#if resource.type === "link"}
                    <li class="challenge-resource"><i class="fa-solid fa-link"></i> <a href={resource.implied_text}>{resource.displayed_text}</a></li>
                    {:else if resource.type === "file"}
                    <li class="challenge-resource"><i class="fa-solid fa-file"></i> <a href={resource.implied_text}>{resource.displayed_text}</a></li>
                    {:else}
                    <li class="flex flex-row gap-1 challenge-resource">
                        <p><i class="fa-solid fa-terminal"></i> {resource.displayed_text}</p>
                        <button title="Copy to clipboard" class="relative" on:click={() => {copyToClipboard(resource.implied_text)}}><i class="fa-solid fa-copy"></i>
                            {#if show_copied_message}
                            <div class="absolute bottom-6 -translate-x-5 py-2 px-2 text-xs rounded-md bg-background-dark">Copied!</div>
                            {/if}
                        </button>

                    </li>
                    {/if}
                    {/each}
                </ul>
                <p class="author font-bold"><i class="fa-solid fa-pen"></i> {challenge_data.author}</p>
                <div class="first-solvers-wrapper flex flex-col justify-start">
                    <h5 class="font-bold">First Solvers:</h5>
                    <ol class="first-solvers flex flex-col justify-start list-decimal list-inside">
                        {#each challenge_data.first_solvers as solver}
                        <li class="solver">{solver.username}</li>
                        {/each}
                    </ol>
                </div>
            </div>
        </section>
        <section class="bottom absolute w-10/12 bottom-2">
            <form action="" class="flag-submission-form flex flex-row gap-1 w-full">
                <input type="text" class="flag w-full px-1 rounded-sm bg-foreground-dark" placeholder="SPETSCTF&#123;...&#125;">
                <button class="submit-flag w-8 h-8 text-center rounded-sm bg-foreground-dark"><i class="fa-solid fa-paper-plane"></i></button>

            </form>
        </section>
    </dialog>
</div>
{/if}