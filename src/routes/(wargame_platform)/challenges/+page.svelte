<script lang="ts">
	import ChallengeCard from '$lib/components/ChallengeCard.svelte';
	import ChallengeDialog from '$lib/components/ChallengeDialog.svelte';
	import { page } from '$app/state';
	let { data } = $props();
	let { translations, challenges } = data;
	$inspect(challenges);

  import { capitalizeFirstLetter } from '$lib/utils/utils.js';
  import { Search, ChevronDown } from '@lucide/svelte';
  import VSeperator from '$lib/components/VSeperator.svelte';
  import BackToTop from '$lib/components/BackToTop.svelte';

	let challengeId = $derived(page.url.searchParams.get('show'));

	let showChallengeDialog: boolean = $derived(challengeId !== null);

  import { playAnimations } from "$lib/gsap/animations";
	import { onDestroy, onMount } from 'svelte';

	let categories = [
		'crypto',
		'forensics',
		'introduction',
		'misc',
		'osint',
		'pwn',
		'reversing',
		'web'
	];

	let modalData = $derived.by(() => {
		if (showChallengeDialog) {
			return challenges.find((chall) => String(chall.challenge_id) === challengeId);
		} else {
			return undefined;
		}
	});

  let componentRoot : HTMLElement;
  let gsapContext: gsap.Context | undefined;

  onMount(() => {
    gsapContext = playAnimations(componentRoot)
  })

  onDestroy(() => {
    gsapContext?.revert()
  })
</script>

<main class="content pt-24 w-[85%] m-auto" bind:this={componentRoot}>
  <header class="flex flex-col justify-center items-center gap-3 mb-16">
    <p class="text-text-200 gsap-top-down-opacity">Challenge yourself, practise and gain points.</p>
    <div class="flex items-center justify-center flex-wrap gap-4 gsap-top-down-opacity">
      <div class="relative">
        <input type="text" name="search" placeholder="Search" class="bg-bg-800 rounded-lg px-5 h-8 w-96 placeholder:text-text-200 outline-none focus:bg-bg-700 transition-colors">
        <Search strokeWidth=3 size=20 color="var(--color-text-200)" class="absolute right-4 top-1/2 transform -translate-y-1/2" />
      </div>
      <div class="relative">
        <select name="filter" class="bg-bg-800 rounded-lg px-5 h-8 w-48 appearance-none">
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
        <ChevronDown strokeWidth=3 size=20 color="var(--color-text-200)" class="absolute right-4 top-1/2 transform -translate-y-1/2" />
      </div>
    </div>
  </header>
	<section class="challenge-container w-full">
		{#each categories as category}
			<div class="category-container mb-16">
				<h3 class="category-header text-lg font-bold mb-2 gsap-top-down-opacity">
					{capitalizeFirstLetter(category)}
				</h3>
				{#if challenges.filter((challenge) => challenge.challenge_category == category?.toLowerCase()).length > 0}
					<ul class="flex gap-8 mb-12">
						{#each challenges.filter((challenge) => challenge.challenge_category == category?.toLowerCase()) as challenge_data}
							<li class="min-h-35 min-w-65 gsap-left-right-opacity">
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
	<ChallengeDialog challenge_data={modalData} {translations}></ChallengeDialog>
{/if}
<BackToTop />
