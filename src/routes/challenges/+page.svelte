<script lang="ts">
	import ChallengeCard from '../../components/challengeCard.svelte';
	import ChallengeDialog from '../../components/challengeDialog.svelte';
	import type { resource, solver, Challenge_data } from '../../types';

	let { data } = $props();
	let { translations, challengeId } = data;
	$inspect(challengeId);
	console.log(challengeId)
	console.log(challengeId)
	console.log(typeof(challengeId))
	console.log(challengeId)
	console.log(challengeId)

	let show_challenge_dialog:boolean = $derived(challengeId !== null);
	// console.log(show_challenge_dialog)

	// Test data
	let challenge_data_example = {
		name: 'Test',
		id: `${Math.floor(Math.random() * 10000)}`,
		description: 'this is a test challenge',
		resources: [
			{ displayed_text: 'link_to_webpage', implied_text: '/', type: 'link' },
			{ displayed_text: 'link_to_sourcecode', implied_text: '/scoreboard', type: 'link' }
		],
		author: 'ZebrasNotHorses',
		points: Math.floor(Math.random() * 500),
		num_solves: Math.floor(Math.random() * 50),
		main_category: 'web',
		sub_categories: ['crypto', 'pwn', 'blockchain'],
		first_solvers: [{ username: 'ZebrasNotHorses', class: '230S' }]
	};
	let challenge_data_example2 = {
		name: 'Test',
		id: `${Math.floor(Math.random() * 10000)}`,
		description:
			'this is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challengethis is a test challenge',
		resources: [
			{ displayed_text: 'link_to_webpage', implied_text: '/', type: 'link' },
			{ displayed_text: 'link_to_sourcecode', implied_text: '/scoreboard', type: 'command' }
		],
		author: 'ZebrasNotHorses',
		points: Math.floor(Math.random() * 500),
		num_solves: Math.floor(Math.random() * 50),
		main_category: 'crypto',
		sub_categories: ['web', 'pwn', 'blockchain'],
		first_solvers: [{ username: 'ZebrasNotHorses', class: '230S' }]
	};
	let skibidi_challenge_data = {
		name: 'Skibidi Challenge',
		id: "1",
		description:
			'Sigma, sigma, on the wall, who is the skibidiest of them all. Who thy taxed in the way of the fanum, when thou hath the knowing thy shall be he who skibidi',
		resources: [
			{ displayed_text: 'link_to_webpage', implied_text: '/', type: 'command' },
			{ displayed_text: 'link_to_sourcecode', implied_text: '/scoreboard', type: 'file' }
		],
		author: 'ZebrasNotHorses',
		points: Math.floor(Math.random() * 500),
		num_solves: Math.floor(Math.random() * 50),
		main_category: 'web',
		sub_categories: ['crypto', 'osint', 'pwn', 'blockchain'],
		first_solvers: [{ username: 'ZebrasNotHorses', class: '230S' }]
	};

	let challenges = [
		challenge_data_example,
		skibidi_challenge_data,
		challenge_data_example,
		challenge_data_example,
		challenge_data_example,
		challenge_data_example,
		challenge_data_example2,
		challenge_data_example2,
		challenge_data_example2,
		challenge_data_example2,
		challenge_data_example2
	];
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
	let modal_data: Challenge_data|undefined = $derived.by(() => {
		if (show_challenge_dialog){
			console.log(challenges)
			console.log(challengeId)
			console.log(challenges.find((chall) => String(chall.id) === challengeId))
			return challenges.find((chall) => String(chall.id) === challengeId)
		}
		else{
			return undefined
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

				{#if challenges.filter((challenge) => challenge.main_category == category?.toLowerCase()).length > 0}
					<ul
						class="grid-auto-rows-[150px] grid auto-rows-min grid-cols-[repeat(auto-fit,minmax(200px,1fr))] items-stretch gap-4"
					>
						{#each challenges.filter((challenge) => challenge.main_category == category?.toLowerCase()) as challenge_data}
							<li>
								<a href={`challenges?show=${challenge_data.id}`} onclick={() => {challengeId = challenge_data.id}} data-sveltekit-replacestate class="h-38 w-full"
									><ChallengeCard data={{challenge_data:challenge_data}}></ChallengeCard></a
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
	<ChallengeDialog
		challenge_data={modal_data}
		{translations}
	></ChallengeDialog>
{/if}
<!-- {#each challenges as challenge_data}
    <ChallengeCard challenge_data={challenge_data}></ChallengeCard>
{/each} -->
