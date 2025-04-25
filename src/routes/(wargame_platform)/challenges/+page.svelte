<script lang="ts">
	import ChallengeCard from '$lib/components/ChallengeCard.svelte';
	import ChallengeDialog from '$lib/components/ChallengeDialog.svelte';
	import { page } from '$app/state';
	import { categories } from '$lib/db/constants';
	let { data, form } = $props();
	let { translations, challenges } = data;
	$inspect(challenges);

	import { capitalizeFirstLetter } from '$lib/utils/utils.js';
	import { Search, ChevronDown } from '@lucide/svelte';
	import VSeperator from '$lib/components/VSeperator.svelte';
	import BackToTop from '$lib/components/BackToTop.svelte';

	let challengeId = $derived(page.url.searchParams.get('show'));

	let showChallengeDialog: boolean = $derived(challengeId !== null);

	import { playAnimations } from '$lib/gsap/animations';
	import { onDestroy, onMount } from 'svelte';

	let modalData = $derived.by(() => {
		if (showChallengeDialog) {
			return challenges.find((chall) => String(chall.challenge_id) === challengeId);
		} else {
			return undefined;
		}
	});

	let componentRoot: HTMLElement;
	let gsapContext: gsap.Context | undefined;

	onMount(() => {
		gsapContext = playAnimations(componentRoot);
	});

	onDestroy(() => {
		gsapContext?.revert();
	});
</script>

<main class="content m-auto w-[85%] pt-24" bind:this={componentRoot}>
	<header class="mb-16 flex flex-col items-center justify-center gap-3">
		<p class="text-text-200 gsap-top-down-opacity">Challenge yourself, practise and gain points.</p>
		<div class="gsap-top-down-opacity flex flex-wrap items-center justify-center gap-4">
			<div class="relative">
				<input
					type="text"
					name="search"
					placeholder="Search"
					class="bg-bg-800 placeholder:text-text-200 focus:bg-bg-700 h-8 w-96 rounded-lg px-5 transition-colors outline-none"
				/>
				<Search
					strokeWidth="3"
					size="20"
					color="var(--color-text-200)"
					class="absolute top-1/2 right-4 -translate-y-1/2 transform"
				/>
			</div>
			<div class="relative">
				<select name="filter" class="bg-bg-800 h-8 w-48 appearance-none rounded-lg px-5">
					<option value="">All</option>
					<option value="crypto">Crypto</option>
					<option value="forensics">Forensics</option>
					<option value="introduction">Introduction</option>
					<option value="misc">Misc</option>
					<option value="osint">OSINT</option>
					<option value="pwn">Pwn</option>
					<option value="reversing">Reversing</option>
					<option value="web">Web</option>
				</select>
				<ChevronDown
					strokeWidth="3"
					size="20"
					color="var(--color-text-200)"
					class="absolute top-1/2 right-4 -translate-y-1/2 transform"
				/>
			</div>
		</div>
	</header>
	<section class="challenge-container w-full">
		{#each categories as category}
			<div class="category-container mb-16">
				<h3 class="category-header gsap-top-down-opacity mb-2 text-lg font-bold">
					{capitalizeFirstLetter(category)}
				</h3>
				{#if challenges.filter((challenge) => challenge.challenge_category == category?.toLowerCase()).length > 0}
					<ul class="mb-12 flex flex-wrap gap-8">
						{#each challenges.filter((challenge) => challenge.challenge_category == category?.toLowerCase()) as challenge_data}
							<li class="gsap-left-right-opacity min-h-35 min-w-65">
								<a
									href={`challenges?show=${challenge_data.challenge_id}`}
									data-sveltekit-noscroll
									class="ignore-default h-38 w-full"
									><ChallengeCard data={{ challenge_data: challenge_data }}></ChallengeCard></a
								>
							</li>
						{/each}
					</ul>
				{:else}
					<p class="mb-4">No challenges yet</p>
				{/if}
				<VSeperator />
			</div>
		{/each}
	</section>
</main>
{#if challengeId}
	<ChallengeDialog challenge_data={modalData} {translations} {form}></ChallengeDialog>
{/if}
<BackToTop />
