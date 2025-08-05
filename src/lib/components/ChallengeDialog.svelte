<script lang="ts">
	import { Link, SquareTerminal, Copy, File, UserRoundPen, CircleX } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { page } from '$app/state';

	import { capitalizeFirstLetter } from '$lib/utils/utils';

	import { playAnimations } from '$lib/gsap/animations';

	import Button from './Button.svelte';
	import { map } from '$lib/utils/utils';
	import { onMount, onDestroy } from 'svelte';
	import { categories } from '$lib/db/constants';

	let {
		challenge_data = {
			challenge_id: '',
			challenge_name: '',
			challenge_description: '',
			challenge_category: null,
			challenge_sub_categories: '',
			points: 0,
			flag_format: '',
			created_at: null,
			first_solvers: [],
			num_solves: '0',
			solved: false,
			resources: [],
			author: null
		},
		translations,
		form
	} = $props();

	function getPointColor(points: number): string {
		const lab_a = Math.floor(map(points, 0, 500, -128, 128));
		return `lab(90% ${lab_a} 128)`;
	}
	let pointElement: HTMLElement;
	$effect(() => {
		if (pointElement !== undefined) {
			pointElement.style.color = getPointColor(challenge_data.points);
		}
	});

	let filteredCategories = categories.filter(
		(_, index) =>
			challenge_data.challenge_sub_categories.split('').reverse().join('')[index] === '1'
	);

	// Needs to be changed to handle when there are multiple commands that can be copied
	let show_copied_message = $state(false);

	async function copyToClipboard(text_to_copy: string) {
		try {
			await navigator.clipboard.writeText(text_to_copy).then(() => {
				show_copied_message = true;
				setTimeout(() => {
					show_copied_message = false;
				}, 1000);
			});
		} catch (err) {
			console.error('Failed to copy!', err);
		}
	}

	function closeDialog() {
		const newUrl = new URL(page.url);
		newUrl.searchParams.delete('show');
		goto(newUrl, { replaceState: true, noScroll: true });
	}

	let keydownHandler: (e: KeyboardEvent) => void;

	let gsapContext: gsap.Context | undefined;
	let componentRoot: HTMLElement;

	onMount(() => {
		gsapContext = playAnimations(componentRoot);

		keydownHandler = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				closeDialog();
			}
		};

		document.addEventListener('keydown', keydownHandler);
	});

	onDestroy(() => {
		gsapContext?.revert();

		if (keydownHandler) {
			document.removeEventListener('keydown', keydownHandler);
		}
	});
</script>

<div
	bind:this={componentRoot}
	class="backdrop bg-overlay prevent-default fixed top-0 left-0 z-20 flex h-screen w-screen items-center justify-center overflow-y-scroll pt-16"
>
	<button
		type="button"
		class="fixed inset-0 h-full w-full cursor-default focus:outline-none"
		onclick={(e) => {
			if (e.currentTarget === e.target) {
				closeDialog();
			}
		}}
		aria-label="Close challenge details"
	></button>
	<dialog
		class="bg-bg-800 gsap-opacity relative m-auto flex w-[85%] max-w-[1000px] flex-col overflow-y-scroll rounded-lg px-4 py-12 sm:px-8 md:px-10 lg:px-16"
	>
		<section class="-mt-2 mb-12 flex w-full justify-between">
			{#if challenge_data.created_at}
				<p class="text-primary-light mb-0.5 font-mono text-sm font-bold">{translations.uploaded} {challenge_data.created_at.toLocaleDateString('sv-SE')}</p>
			{:else}
				<p class="text-primary-light mb-0.5 font-mono text-sm font-bold">{translations.unknown_creation_time}</p>
			{/if}
			<button type="button" onclick={() => closeDialog()} class="cursor-pointer">
				<CircleX
					color="var(--color-text-200)"
					size="20"
					class="hover:stroke-text-100 transition-colors"
				/>
			</button>
		</section>
		<section class="top mb-6 flex w-full items-center justify-between">
			<h3 class="challenge-name text-text-100 text-xl font-bold">
				{challenge_data.challenge_name}
			</h3>
		</section>
		<section
			class="middle text-foreground-dark mb-24 flex h-full w-full flex-row flex-wrap justify-center gap-y-8 overflow-hidden"
		>
			<div class="w-1/2 min-w-70 flex-grow">
				<div class="mb-4 flex flex-col">
					<p class="text-text-200">Resources:</p>
					<ul class="resources flex flex-col gap-0 pl-4">
						{#each challenge_data.resources as resource}
							{#if resource.type === 'web'}
								<li
									class="challenge-resource text-foreground-light dark:text-foreground-dark flex h-fit flex-row items-center gap-1 underline"
								>
									<Link class="size-4"></Link>
									<a href={resource.content} class="ignore-default h-fit"
										>{resource.content
											.split('//')[1]
											.split('/')[0]
											.split('.')
											.slice(-2)
											.join('.')
											.slice(0, 35)}{resource.content
											.split('//')[1]
											.split('/')[0]
											.split('.')
											.slice(-2)
											.join('.').length > 35
											? '...'
											: ''}</a
									>
								</li>
							{:else if resource.type === 'file'}
								<li class="challenge-resource flex flex-row items-center gap-1">
									<File class="size-4"></File>
									<a href={resource.content} class="ignore-default h-fit"
										>{resource.content.split('/')[3].slice(0, 35)}{resource.content.split('/')[3]
											.length > 35
											? '...'
											: ''}</a
									>
								</li>
							{:else}
								<li class="challenge-resource flex flex-row items-center gap-1">
									<SquareTerminal class="size-4"></SquareTerminal>

									<p>
										{resource.content}
									</p>
									<button
										title="Copy to clipboard"
										class="ignore-default relative"
										onclick={() => {
											copyToClipboard(resource.content);
										}}
									>
										<Copy class="size-4"></Copy>
										{#if show_copied_message}
											<div
												class="bg-background-dark text-background-light absolute bottom-6 -translate-x-5 rounded-md px-2 py-2 text-xs"
											>
												Copied!
											</div>
										{/if}
									</button>
								</li>
							{/if}
						{/each}
					</ul>
				</div>
				<div class="author mb-2">
					<UserRoundPen class="mb-0.5 inline-block" color="var(--color-text-200)" size="16"
					></UserRoundPen>
					<p class="text-text-200 inline-block text-sm">Author:&nbsp;</p>
					<p class="inline-block text-sm font-bold">
						{challenge_data.author ? challenge_data.author : 'Anonymous'}
					</p>
				</div>
				<div class="description">
					<p class="text-text-200 inline-block text-sm">Description:&nbsp;</p>
					<p
						class="challenge-description text-foreground-light dark:text-foreground-dark mr-1 max-h-full overflow-scroll"
					>
						{challenge_data.challenge_description}
					</p>
				</div>
			</div>
			<div class="right w-1/2 min-w-70 flex-grow">
				{#if !challenge_data.solved && (!form || !form.success)}
					<form action="?/submit" method="POST" class="flag-submission-form max-w-full" use:enhance>
						<label for="flag" class="text-sm">Submit flag</label>
						<div class="relative mt-2 mb-8">
							<input
								type="text"
								name="flag"
								class="flag bg-bg-600 w-full rounded-xl px-6 py-1.5 font-mono focus:outline-none"
								placeholder={challenge_data.flag_format}
							/>
							<input type="hidden" value={challenge_data.challenge_id} name="challenge_id" />
							<div class="absolute top-1/2 right-0 -translate-y-1/2 transform">
								<Button
									label="Submit"
									type="submit"
									ariaLabel="Submit flag"
									bgColor="bg-bg-500"
									outlineColor="outline-transparent"
									hoverColor="hover:bg-secondary"
								/>
							</div>
						</div>
					</form>
				{:else}
					<p
						class="from-primary to-primary-light rounded-xl bg-gradient-to-br py-2 text-center font-semibold"
					>
						Challenge Already Solved
					</p>
				{/if}
				<div
					class="first-solvers-wrapper text-foreground-light dark:text-foreground-dark flex flex-col justify-start"
				>
					{#if challenge_data.num_solves != 0}
						<h5 class="text-text-200">First Solvers:</h5>
						<ol class="first-solvers flex list-inside list-decimal flex-col justify-start">
							{#each challenge_data.first_solvers as solver}
								<li class="solver">{solver.display_name}</li>
							{/each}
						</ol>
					{:else}
						<p>This challenge has no solvers yet.</p>
					{/if}
				</div>
			</div>
		</section>
		<section class="flex w-full flex-wrap justify-between gap-x-12 gap-y-4">
			<ul
				class="categories @container flex h-fit w-fit flex-row flex-wrap"
				style="container-type:normal"
			>
				{#each filteredCategories as category, index}
					<li
						class="text-text-100 px-7 py-1 text-xs
            {index === 0 ? 'bg-gradient-100 rounded-l-xl rounded-bl-xl' : ''}
            {index === 1 ? 'bg-gradient-200' : ''}
            {index === 2 ? 'bg-gradient-300' : ''}
			{index > 2 ? 'bg-neutral-800' : ''}
            {index === filteredCategories.length - 1 ? 'rounded-r-xl rounded-br-xl' : ''}"
					>
						<p>{capitalizeFirstLetter(category)}</p>
					</li>
				{/each}
			</ul>
			<div class="flex flex-row gap-10">
				<p class="font-mono text-sm font-bold" bind:this={pointElement}>
					{challenge_data.points}&nbsp;&nbsp;<span class="text-text-200">POINTS</span>
				</p>
				<p class="text-text-100 font-mono text-sm font-bold">
					{challenge_data.num_solves}&nbsp;&nbsp;<span class="text-text-200">SOLVERS</span>
				</p>
			</div>
		</section>
	</dialog>
</div>
