<script lang="ts">
	// import { derived } from "svelte/store";

    let players = $state([
        {username: "Regnm0ln1", score:Math.floor(Math.random()*100000), class:"230S", school:"Hitachigymnasiet Västerås"},
        {username: "Eritho", score:Math.floor(Math.random()*10000), class:"230S", school:"Hitachigymnasiet Västeråsllllllllllllllll"},
        {username: "Agartha Warriors", score:Math.floor(Math.random()*10000), class:"230S", school:"Hitachigymnasiet Västerås"},
        {username: "ZebrasNotHorses", score:Math.floor(Math.random()*10000), class:"230S", school:"Hitachigymnasiet Västerås"},
        {username: "Black Mesa", score:Math.floor(Math.random()*10000), class:"220S", school:"Hitachigymnasiet Västerås"},
        {username: "Vår Herres Knektar", score:Math.floor(Math.random()*10000), class:"230S", school:"Hitachigymnasiet Västerås"},
        {username: "Bra Fråga", score:Math.floor(Math.random()*10000), class:"230S", school:"Hitachigymnasiet Västerås"},
        {username: "Ian Terzo", score:Math.floor(Math.random()*10000), class:"230S", school:"Hitachigymnasiet Västerås"},
        {username: "Nils Nachname", score:Math.floor(Math.random()*10000), class:"230S", school:"Hitachigymnasiet Västerås"},
    ])

    const include_schools = $derived([...new Set(players.map(obj => obj.school))]);
    let include_classes = $derived([...new Set(players.map(obj => obj.class))]);

    let sorted_players = $derived.by(() => {
        return [...players].sort((a, b) => b.score - a.score).filter((player) => {return include_schools.includes(player.school) && include_classes.includes(player.class)})
    });


</script>


<div class="scoreboard flex flex-row justify-center w-full mt-10">

    <!-- <ol class="scoreboard flex flex-col list-decimal list-inside"> -->
     <table class="w-8/10 overflow-scroll">
        <thead>
            <tr class=" my-10 border-b-1 border-b-[var(--color-accent-dark)]">
                <th class="px-2 uppercase font-bold text-left w-5">#</th>
                <th class="px-2 uppercase font-bold text-left w-fit">Username</th>
                <!-- <th class="px-4 uppercase font-bold text-left w-fit">School</th> -->
                <th class="px-4 uppercase font-bold text-center w-5">Class</th>
                <th class="px-2 uppercase font-bold text-right w-5">Score</th>
            </tr>
        </thead>
        <tbody>
            {#each sorted_players as player, i}
            <tr class="border-b-1 border-b-[var(--color-accent-dark)] outline-[var(--color-accent-dark)]">
                <td class="px-2 h-15 mt-2 text-left">{i+1}</td>
                <td class="px-2 h-15 mt-2 text-left">{player.username}</td>
                <!-- <td class="px-4 h-12 mt-2 text-left">{player.school}</td> -->
                <td class="px-4 h-15 mt-2 text-center">{player.class}</td>
                <td class="px-2 h-15 mt-2 text-right">{player.score}</td>
            </tr>
            {/each}
        </tbody>
     </table>

</div>
