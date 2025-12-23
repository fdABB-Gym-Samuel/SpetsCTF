<script lang="ts">
	import ChallengeCard from '$lib/components/ChallengeCard.svelte';
	import WarningDialog from '$lib/components/WarningDialog.svelte';
	import Button from '$lib/components/Button.svelte';
	import { categories } from '$lib/db/constants';
	import { goto } from '$app/navigation';

	let { data, form } = $props();

	let allChallenges = $derived(data.allChallenges);
	let myChallenges = $derived(data.myChallenges);
	let translations = $derived(data.translations);
	let user = $derived(data.user);

	import { capitalizeFirstLetter } from '$lib/utils/utils.js';
	import { Search, ChevronDown, Pen, Trash2, LogIn } from '@lucide/svelte';
	import VSeperator from '$lib/components/VSeperator.svelte';
	import BackToTop from '$lib/components/BackToTop.svelte';
	import { playAnimations } from '$lib/gsap/animations';
	import { onDestroy, onMount } from 'svelte';
	import HSeperator from '$lib/components/HSeperator.svelte';
	import { resolve } from '$app/paths';

	let componentRoot: HTMLElement;
	let gsapContext: gsap.Context | undefined;

	let challengesTabs = [
		{ label: 'All Challenges', tab: 'all' },
		{ label: 'My Challenges', tab: 'my' }
	];

	let currentTab: 'all' | 'my' = $state('all');

	const switchTab = (newTab: 'all' | 'my') => {
		currentTab = newTab;
	};

	const openDeleteDialog = (challengeId: string, challengeName: string) => {
		challengeIdToDelete = challengeId;
		challengeNameToDelete = challengeName;
	};

	const closeDeleteDialog = () => {
		challengeIdToDelete = '';
		challengeNameToDelete = '';
	};

	let challengeIdToDelete = $state('');
	let challengeNameToDelete = $state('');
	
	onMount(() => {
		gsapContext = playAnimations(componentRoot);
	});

	onDestroy(() => {
		gsapContext?.revert();
	});
</script>

<main class="content w-[100%] pt-20 sm:m-auto" bind:this={componentRoot}>
	<header class="mb-16 flex flex-col items-center justify-center gap-3">
		<p class="text-text-200 gsap-top-down-opacity">Challenge yourself, practise and gain points.</p>
		<div class="gsap-top-down-opacity flex flex-wrap items-center justify-center gap-4">
			<div class="relative">
				<input
					type="text"
					name="search"
					placeholder="Search"
					class="bg-bg-800 placeholder:text-text-200 focus:bg-bg-700 h-8 max-w-96 rounded-lg px-5 transition-colors outline-none"
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
	<nav class="flex w-full flex-col gap-2">
		<ul class="flex w-full flex-row gap-5">
			{#each challengesTabs as tab (tab.tab)}
				<li>
					<button
						class:border-b-2={currentTab === tab.tab}
						onclick={() => {
							switchTab(tab.tab as 'all' | 'my');
						}}>{tab.label}</button
					>
				</li>
			{/each}
		</ul>
		<VSeperator></VSeperator>
	</nav>
	{#if currentTab === 'all'}
		<section class="challenge-container w-full">
			{#each categories as category (category)}
				<div class="category-container mb-16">
					<h3 class="category-header gsap-top-down-opacity mb-2 text-lg font-bold">
						{capitalizeFirstLetter(category)}
					</h3>
					{#if allChallenges.filter((challenge) => challenge.challenge_category == category?.toLowerCase()).length > 0}
						<ul
							class="grid grid-cols-[repeat(auto-fill,minmax(305px,1fr))] gap-4 sm:grid-cols-[repeat(auto-fill,minmax(350px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(390px,1fr))]"
						>
							{#each allChallenges.filter((challenge) => challenge.challenge_category == category?.toLowerCase()) as challengeData (challengeData.challenge_id)}
								<li class="gsap-left-right-opacity min-h-fit min-w-65">
								<a						
										href={`/challenges/${challengeData.challenge_id}`}
										data-sveltekit-noscroll
										class="ignore-default block h-full w-full"
										><ChallengeCard data={{ challengeData: challengeData }}></ChallengeCard></a
									>
								</li>
							{/each}
						</ul>
					{:else}
						<p class="mb-4">No challenges yet</p>
					{/if}
					<br />
					<VSeperator />
				</div>
			{/each}
		</section>
	{:else if currentTab === 'my'}
		{#if user}
			<section>
				<Button
					label="Create Challenge"
					type="button"
					onClick={() => goto(resolve('/create-challenge'))}
					Icon={Pen}
					ariaLabel="Go to challenges"
				></Button>
				{#if myChallenges !== null && myChallenges?.length > 0}
					<ul class="flex flex-col">
						{#each myChallenges as challenge (challenge.challenge_id)}
							<li
								class="border-bg-500 flex h-16 w-full flex-row items-center justify-between border-b-2 px-4 py-2"
							>
								<p class="w-full">{challenge.challenge_name}</p>
								<HSeperator color="bg-bg-500"></HSeperator>
								<div class="ml-4 flex h-full flex-row items-center gap-2">
									<Button
										label=""
										ariaLabel="Edit Challenge"
										type="button"
										styleType="icon"
										onClick={() => {
											goto(resolve(`/edit-challenge/${challenge.challenge_id}`));
										}}
										Icon={Pen}
									></Button>
									<Button
										label=""
										ariaLabel="Delete challenge"
										type="button"
										styleType="icon"
										bgColor="bg-red-700"
										onClick={() => {
											openDeleteDialog(challenge.challenge_id, challenge.challenge_name);
										}}
										Icon={Trash2}
									></Button>
								</div>
							</li>
						{/each}
					</ul>
				{/if}
			</section>
		{:else}
			<Button
				label={translations.login}
				type="button"
				onClick={() => goto(resolve('/login'))}
				Icon={LogIn}
				ariaLabel="Login"
			/>
		{/if}
	{/if}
</main>

{#if challengeIdToDelete}
	<WarningDialog
		warningTitle='Delete Challenge?'
		warningDescription={`Are you sure you want to delete ${challengeNameToDelete}`}
		confirmationButtonText='Delete'
		confirmationButtonIcon={Trash2}
		action="?/delete"
		close={closeDeleteDialog}
		warningAria="Delete challenge"
		{form}
		hiddenData={challengeIdToDelete}
		hiddenName="challengeId"
	></WarningDialog>
{/if}
<BackToTop />
