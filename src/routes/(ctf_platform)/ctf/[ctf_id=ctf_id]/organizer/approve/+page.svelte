<script lang="ts">
	import { page } from '$app/state';
	import ChallengeCard from '$lib/components/ChallengeCard.svelte';

	let { data } = $props();
	let { translations, unapprovedChallenges } = data;
</script>

<div class="content">
	{#if page.url.searchParams.get('status') === 'approved'}
		<div class="mb-4">
			<h3 class="text-green-600">Challenge successfully approved</h3>
		</div>
	{/if}
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
				<li>
					<a
						href={`approve/${challenge_data.challenge_id}`}
						data-sveltekit-noscroll
						class="ignore-default h-38 w-full"
						><ChallengeCard data={{ challenge_data }}></ChallengeCard></a
					>
				</li>
			{/each}
		</ul>
	</div>
</div>
