<script lang="ts">
	import ChallengeCard from '$lib/components/ChallengeCard.svelte';

	let { data } = $props();
	let { translations, unapprovedChallenges } = data;

	console.log(unapprovedChallenges);
</script>

<div class="content">
	<div class="mb-4">
		<h1 class="route-title">Approve challenges</h1>
		<p>
			This is where you as an organizer can approve challenges users have submitted for your CTF
		</p>
	</div>
	<div>
		<h3>All Challenges</h3>

		<ul class="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
			{#each unapprovedChallenges as challenge_data}
				<ChallengeCard data={{ challenge_data }}></ChallengeCard>
			{/each}
		</ul>
	</div>
</div>
