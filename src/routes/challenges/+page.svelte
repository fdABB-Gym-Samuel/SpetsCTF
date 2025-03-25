<script lang="ts">
	import ChallengeCard from '../../components/challengeCard.svelte';
	import ChallengeDialog from '../../components/challengeDialog.svelte';
	import type { resource, solver, Challenge_data } from '../../types';
	import { page } from '$app/state';
	let { data } = $props();
	let { translations, challenges } = data;

	let challengeId = $derived(page.url.searchParams.get('show'));

	// $inspect(challengeId);

	let show_challenge_dialog: boolean = $derived(challengeId !== null);

	let categories = [
		'Introduction',
		'Web',
		'Pwn',
		'Crypto',
		'Reversing',
		'Forensics',
		'Osint',
		'Blockchain',
		'Misc'
	];
	let modal_data = $derived.by(() => {
		if (show_challenge_dialog) {
			return challenges.find((chall) => String(chall.challenge_id) === challengeId);
		} else {
			return undefined;
		}
	});
</script>

<div class="content">
	<h1 class="route-title">{translations.challenges}</h1>
	<article class="challenge-container w-full">
		{#each categories as category}
			<section class="category-container flex flex-col">
				<h3 class="category-header my-4 border-b-2 border-[var(--color-accent-dark)] pb-1">
					{category}
				</h3>

				{#if challenges.filter((challenge) => challenge.challenge_category == category?.toLowerCase()).length > 0}
					<ul
						class="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4"
					>
					<!-- <ul
						class="flex flex-row flex-wrap gap-4"
					> -->
						{#each challenges.filter((challenge) => challenge.challenge_category == category?.toLowerCase()) as challenge_data}
							<li class="min-h-35 min-w-65">
								<a
									href={`challenges?show=${challenge_data.challenge_id}`}
									data-sveltekit-noscroll
									class="h-38 w-full ignore-default"
									><ChallengeCard data={{ challenge_data: challenge_data }}></ChallengeCard></a
								>
							</li>
						{/each}
					</ul>
				{:else}
					<p>No challenges yet</p>
				{/if}
			</section>
		{/each}
	</article>
</div>
{#if challengeId}
	<ChallengeDialog challenge_data={modal_data} {translations}></ChallengeDialog>
{/if}
<!-- {#each challenges as challenge_data}
    <ChallengeCard challenge_data={challenge_data}></ChallengeCard>
{/each} -->
