<script lang="ts">
    import type { resource, Challenge_data } from "../types"
    export let challenge_data: Challenge_data = {
        name: "Not Found",   
        desc: "",
        resources: [],
        author: "",
        points: 0,
        num_solves: 0,
        main_category: "",
        sub_categories: [],
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
                    }, 1500);
                })
        } catch (err) {
          console.error("Failed to copy!", err);
        }
    }
    // show_challenge_dialog = false

</script>

{#if show_challenge_dialog}

<div on:click|self on:keydown|self role=button tabindex="0" class="backdrop flex justify-center items-center bg-backdrop fixed top-0 h-screen w-screen">
    <dialog class="flex flex-col gap-5 h-[var(--challenge-dialog-height)] w-[var(--challenge-dialog-width)] m-auto rounded-md bg-button-dark px-[var(--challenge-padding-inline)]">
        <section class="top flex flex-col items-center">
            <h3 class="challenge-title text-5xl text-foreground-dark pt-5 pb-2">{challenge_data.name}</h3>
            <ul class="categroies flex flex-row justify-center flex-wrap w-8/10">
                {#each [challenge_data.main_category, ...challenge_data.sub_categories] as category}
                <li class="text-xs bg-foreground-dark text-background-dark px-2 py-1 mr-1.5 mt-1 rounded-md">{category}</li>
                {/each}
            </ul>
        </section>
        <section class="flex flex-row bottom text-foreground-dark justify-between">
            <p class="challenge-description w-2/5">{challenge_data.desc}</p>
            <ul class="resources">
                {#each challenge_data.resources as resource}
                {#if resource.is_link}
                <li><a href={resource.implied_text}>{resource.displayed_text}</a></li>
                {:else}
                <li class="flex flex-row gap-1">
                    <p>{resource.displayed_text}</p>
                    <button title="Copy to clipboard" class="relative" on:click={() => {copyToClipboard(resource.implied_text)}}><i class="fa-solid fa-copy"></i>
                        {#if show_copied_message}
                        <div class="absolute bottom-6 -translate-x-5 py-2 px-2 text-xs rounded-md bg-background-dark">Copied!</div>
                        {/if}
                    </button>
                    <!-- {#if show_copied_message}
                    <div class="absolute">Copied!</div>
                    {/if} -->
                </li>
                {/if}
                {/each}
            </ul>
        </section>
    </dialog>
</div>
{/if}