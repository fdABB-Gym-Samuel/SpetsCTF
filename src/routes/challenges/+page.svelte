<script lang="ts">
    import ChallengeCard from "../../components/challengeCard.svelte";
    import ChallengeDialog from "../../components/challengeDialog.svelte";
    import type { resource, Challenge_data } from "../../types";
    

    let show_challenge_dialog = false
    let challenge_data_example = {
        name: "Test",   
        desc: "this is a test challenge",
        resources: [{displayed_text:"link_to_webpage", implied_text: "/", is_link: true}, {displayed_text:"link_to_sourcecode", implied_text:"/scoreboard", is_link:false}],
        author: "ZebrasNotHorses",
        points: 450,
        num_solves: 1,
        main_category: "web",
        sub_categories: ["crypto", "pwn", "blockchain"],
    }
    let challenge_data_example2 = {
        name: "Test",   
        desc: "this is a test challenge",
        resources: [{displayed_text:"link_to_webpage", implied_text: "/", is_link: true}, {displayed_text:"link_to_sourcecode", implied_text:"/scoreboard", is_link:true}],
        author: "ZebrasNotHorses",
        points: 450,
        num_solves: 1,
        main_category: "crypto",
        sub_categories: ["web", "pwn", "blockchain"],
    }
    let challenges = [challenge_data_example, challenge_data_example, challenge_data_example,challenge_data_example, challenge_data_example, challenge_data_example2 ,challenge_data_example2, challenge_data_example2, challenge_data_example2, challenge_data_example2]
    // let challenges = {1: challenge_data_example, 2: challenge_data_example, 3:challenge_data_example, 4:challenge_data_example, 5:challenge_data_example, 6:challenge_data_example, 7:challenge_data_example, 8:challenge_data_example2, 9:challenge_data_example2, 10:challenge_data_example2, 11:challenge_data_example2, 12:challenge_data_example2, 13:challenge_data_example2}
    // let mainCategories = [...new Set(challenges.map(challenge => challenge.main_category))];
    let categories = ["Introduction", "Web", "Pwn", "Crypto", "Reversing", "Forensics", "Osint", "Blockchain", "Misc"];
    let modal_data:Challenge_data;
    const open_dialog = (challenge_data:Challenge_data) => {
        
        modal_data = challenge_data
        show_challenge_dialog = true 
        console.log(show_challenge_dialog)
    }
    
</script>

<h1 class="route-title text-4xl mt-4">Challenges</h1>
<article class="challenge-container w-3/4">
{#each categories as category}
    <section class="category-container flex flex-col">
        <h5 class="category-header text-3xl border-b-2 border-[var(--color-accent-dark)] my-4 pb-1">{category}</h5>
        <!-- {#if Object.entries(challenges).filter(([id, challenge_data]) => challenge_data.main_category === category.toLowerCase()).length > 0} -->
        {#if challenges.filter((challenge) => challenge.main_category==category?.toLowerCase()).length > 0}
        <ul class="grid items-stretch grid-cols-[repeat(auto-fit,minmax(200px,1fr))] grid-auto-rows-[150px] auto-rows-min gap-4">
            {#each challenges.filter((challenge) => challenge.main_category==category?.toLowerCase()) as challenge_data}
             <!-- Gets the id and data of each challenge -->
            <!-- {#each Object.entries(challenges).filter(([id, challenge_data]) => challenge_data.main_category === category.toLowerCase()) as [id, challenge_data]} -->
                <li on:click={() => {open_dialog(challenge_data)}} class="h-38 w-full"><ChallengeCard {challenge_data}></ChallengeCard></li>
            {/each}
        </ul>
        {:else}
        <p>No challenges yet</p>
        {/if}
    </section>
{/each}
</article>

<ChallengeDialog on:click={() => {show_challenge_dialog=false}} challenge_data={modal_data} {show_challenge_dialog}></ChallengeDialog>
<!-- {#each challenges as challenge_data}
    <ChallengeCard challenge_data={challenge_data}></ChallengeCard>
{/each} -->
