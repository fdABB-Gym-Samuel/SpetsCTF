<script lang="ts">
    import ChallengeCard from "../../components/challengeCard.svelte";
    import ChallengeDialog from "../../components/challengeDialog.svelte";
    import type { resource, solver, Challenge_data } from "../../types";
    

    let show_challenge_dialog = false

    // Test data
    let challenge_data_example = {
        name: "Test",   
        id:`${Math.floor(Math.random()*10000)}`,
        description: "this is a test challenge",
        resources: [{displayed_text:"link_to_webpage", implied_text: "/", type: "link"}, {displayed_text:"link_to_sourcecode", implied_text:"/scoreboard", type:"link"}],
        author: "ZebrasNotHorses",
        points: Math.floor(Math.random()*500),
        num_solves: Math.floor(Math.random()*50),
        main_category: "web",
        sub_categories: ["crypto", "pwn", "blockchain"],
        first_solvers: [{username:"ZebrasNotHorses", class:"230S"}]
    }
    let challenge_data_example2 = {
        name: "Test",   
        id:`${Math.floor(Math.random()*10000)}`,
        description: "this is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challenge",
        resources: [{displayed_text:"link_to_webpage", implied_text: "/", type:"link"}, {displayed_text:"link_to_sourcecode", implied_text:"/scoreboard", type:"command"}],
        author: "ZebrasNotHorses",
        points: Math.floor(Math.random()*500),
        num_solves: Math.floor(Math.random()*50),
        main_category: "crypto",
        sub_categories: ["web", "pwn", "blockchain"],
        first_solvers: [{username:"ZebrasNotHorses", class:"230S"}]
    }
    let skibidi_challenge_data = {
        name: "Skibidi Challenge",   
        id:`${Math.floor(Math.random()*10000)}`,
        description: "Sigma, sigma, on the wall, who is the skibidiest of them all. Who thy taxed in the way of the fanum, when thou hath the knowing thy shall be he who skibidi",
        resources: [{displayed_text:"link_to_webpage", implied_text: "/", type:"command"}, {displayed_text:"link_to_sourcecode", implied_text:"/scoreboard", type:"file"}],
        author: "ZebrasNotHorses",
        points: Math.floor(Math.random()*500),
        num_solves: Math.floor(Math.random()*50),
        main_category: "web",
        sub_categories: ["crypto", "osint", "pwn", "blockchain"],
        first_solvers: [{username:"ZebrasNotHorses", class:"230S"}]
    }

    let challenges = [challenge_data_example, skibidi_challenge_data,challenge_data_example, challenge_data_example,challenge_data_example, challenge_data_example, challenge_data_example2 ,challenge_data_example2, challenge_data_example2, challenge_data_example2, challenge_data_example2]
    let categories = ["Introduction", "Web", "Pwn", "Crypto", "Reversing", "Forensics", "Osint", "Blockchain", "Misc"];
    let modal_data:Challenge_data;
    const open_dialog = (challenge_data:Challenge_data) => {
        
        modal_data = challenge_data
        show_challenge_dialog = true 
        console.log(show_challenge_dialog)
    }
    
</script>

<div class="content">
    <h1 class="route-title">Challenges</h1>
    <article class="challenge-container w-full">
    {#each categories as category}
        <section class="category-container flex flex-col">
            <h3 class="category-header border-b-2 border-[var(--color-accent-dark)] my-4 pb-1">{category}</h3>

            {#if challenges.filter((challenge) => challenge.main_category==category?.toLowerCase()).length > 0}
            <ul class="grid items-stretch grid-cols-[repeat(auto-fit,minmax(200px,1fr))] grid-auto-rows-[150px] auto-rows-min gap-4">
                {#each challenges.filter((challenge) => challenge.main_category==category?.toLowerCase()) as challenge_data}
                    <li on:click={() => {open_dialog(challenge_data)}} class="h-38 w-full"><ChallengeCard {challenge_data}></ChallengeCard></li>
                {/each}
            </ul>
            {:else}
            <p>No challenges yet</p>
            {/if}
        </section>
    {/each}
    </article>
</div>
<ChallengeDialog on:click={() => {show_challenge_dialog=false}} challenge_data={modal_data} {show_challenge_dialog}></ChallengeDialog>
<!-- {#each challenges as challenge_data}
    <ChallengeCard challenge_data={challenge_data}></ChallengeCard>
{/each} -->
