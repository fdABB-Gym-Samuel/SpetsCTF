<script lang="ts">
    import ChallengeCard from "../../components/challengeCard.svelte";
    let name = "Test"
    let desc = "This is a test description for a test chall, not meant to be used in prod"
    let rescources = ["link_to_my_file", "link_to_my_other_file"]
    let author = "ZebrasNotHorses"
    let points = 300
    let num_solves = 0
    let categories = ["crypto", "web", "reversing", "pwn", "blockchain"]
</script>

<h1 class="route-title text-4xl mt-4">Challenges</h1>
<ChallengeCard challenge_name={name} challenge_description={desc} challenge_rescources={rescources} author={author} points={points} num_solves={num_solves} categories={categories}></ChallengeCard>