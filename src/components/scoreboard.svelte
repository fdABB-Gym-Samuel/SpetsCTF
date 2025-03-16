<script lang="ts">
	// import { derived } from "svelte/store";
    let { title, type } = $props()
    let players = $state([
        {username: "Regnm0ln1", score:Math.floor(Math.random()*10000), class:"200S", school:"Hitachigymnasiet Västerås"},
        {username: "Eritho", score:Math.floor(Math.random()*10000), class:"180S", school:"Hitachigymnasiet Västeråsllllllllllllllll"},
        {username: "Agartha Warriors", score:Math.floor(Math.random()*10000), class:"2301", school:"Hitachigymnasiet Västerås"},
        {username: "ZebrasNotHorses", score:Math.floor(Math.random()*10000), class:"230S", school:"Hitachigymnasiet Västerås"},
        {username: "Black Mesa", score:Math.floor(Math.random()*10000), class:"220S", school:"Hitachigymnasiet Västerås"},
        {username: "Vår Herres Knektar", score:Math.floor(Math.random()*10000), class:"2202", school:"Hitachigymnasiet Västerås"},
        {username: "Bra Fråga", score:Math.floor(Math.random()*10000), class:"230S", school:"Hitachigymnasiet Västerås"},
        {username: "Ian Terzo", score:Math.floor(Math.random()*10000), class:"230S", school:"Hitachigymnasiet Västerås"},
        {username: "Nils Nachname", score:Math.floor(Math.random()*10000), class:"230S", school:"Hitachigymnasiet Västerås"},
    ])
    
    

    const include_schools = $derived([...new Set(players.map(obj => obj.school))]);
    let original_classes = [...new Set(players.map(obj => obj.class))]
    let include_classes = $state([...new Set(players.map(obj => obj.class))]);

    let sorted_players = $derived.by(() => {
        return [...players].sort((a, b) => b.score - a.score).filter((player) => {return include_schools.includes(player.school) && include_classes.includes(player.class)})
    });


</script>


<div class="scoreboard flex flex-col justify-center min-w-fit flex-grow-1 pt-4">
    <div class="flex flex-col justify-between mb-2">
        <h3 class="scoreboard-title text-5xl">{title}:</h3>
        {#if type === "users"}
        <div class="class-filtering flex flex-row flex-wrap text-center justify-start items-end gap-1 w-full align-middle">
            {#each original_classes as _class}
            <div class="bg-neutral-600 text-neutral-200 px-1 text-sm rounded-sm"
            class:bg-neutral-800={!include_classes.includes(_class)} 
            class:text-neutral-400={!include_classes.includes(_class)}>
                <label class="pr-0.5 h-full align-text-bottom" for={_class}>{_class}</label><input 
                    class="rounded-sm peer appearance-none w-3 h-3 bg-dim-beige checked:bg-accent-dark" 
                    type="checkbox" 
                    id={_class} 
                    on:click={console.log(include_classes)} 
                    bind:group={include_classes} 
                    value={_class}
                >       
            </div>
            {/each}
        </div>
        {/if}
    </div>
    <!-- <ol class="scoreboard flex flex-col list-decimal list-inside"> -->
    <table class="overflow-scroll">
        <thead>
            <tr class=" my-10 w-fit border-b-1 border-b-[var(--color-accent-dark)]">
                <th class="px-2 uppercase font-bold text-left w-1">#</th>
                <th class="px-2 uppercase font-bold text-left w-1">Username</th>
                <!-- <th class="px-4 uppercase font-bold text-left w-fit">School</th> -->
                <th class="px-4 uppercase font-bold text-center w-1">Class</th>
                <th class="px-2 uppercase font-bold text-right w-1">Score</th>
            </tr>
        </thead>
        <tbody>
            {#each sorted_players as player, i}
            <tr class="border-b-1 w-fit text-wrap border-b-[var(--color-accent-dark)] outline-[var(--color-accent-dark)]">
                <td class="px-2 h-12 mt-2 text-left">{i+1}</td>
                <td class="px-2 h-12 mt-2 text-left truncate">{player.username}</td>
                <!-- <td class="px-4 h-12 mt-2 text-left">{player.school}</td> -->
                <td class="px-4 h-12 mt-2 text-center">{player.class}</td>
                <td class="px-2 h-12 mt-2 text-right">{player.score}</td>
            </tr>
            {/each}
        </tbody>
     </table>

</div>
