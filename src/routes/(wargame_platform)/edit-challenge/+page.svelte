<script lang="ts">
	import ChallengeCard from '$lib/components/ChallengeCard.svelte';
	let { data } = $props();
	let { user, translations, editableChallenges } = data;
</script>

<div class="content">
	<div class="mb-4">
		<h1 class="route-title">Editable challenges</h1>
		<p>This is where you can edit challenges you have the rights to edit</p>
	</div>
	<div>
		<h3>My Challenges</h3>
		<ul class="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
			{#each editableChallenges.filter((challenge) => challenge.is_author) as challenge_data}
				<li>
					<a
						href={`edit-challenge/${challenge_data.challenge_id}`}
						data-sveltekit-noscroll
						class="ignore-default h-38 w-full"
						><ChallengeCard data={{ challenge_data }}></ChallengeCard></a
					>
				</li>
			{/each}
		</ul>
	</div>
	{#if user?.is_admin}
		<div>
			<h3>All Challenges</h3>

			<ul class="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
				{#each editableChallenges as challenge_data}
					<li>
						<a
							href={`edit-challenge/${challenge_data.challenge_id}`}
							data-sveltekit-noscroll
							class="ignore-default h-38 w-full"
							><ChallengeCard data={{ challenge_data }}></ChallengeCard></a
						>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>
