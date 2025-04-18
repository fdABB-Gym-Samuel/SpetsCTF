<script lang="ts">
	import { Link, SquareTerminal, Copy, File, UserRoundPen, CirclePlus, Flag } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { SendHorizontal } from '@lucide/svelte';

	let {
		challenge_data = {
			challenge_id: '',
			challenge_name: '',
			challenge_description: '',
			challenge_category: null,
			challenge_sub_categories: '',
			points: 0,
			flag_format: '',
			first_solvers: [],
			num_solves: '0',
			solved: false,
			resources: [],
			author: null
		},
		translations,
		form
	} = $props();

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
</script>

<div
	onclick={(e) => {
		if (e.currentTarget === e.target) {
			const newUrl = new URL(page.url);
			newUrl.searchParams.delete('show');
			goto(newUrl, { replaceState: true, noScroll: true });
		}
	}}
	onkeydown={(e) => {
		if (e.key === ' ' || e.key === 'Escape')
			goto('/challenges', { replaceState: true, noScroll: true });
	}}
	role="button"
	tabindex="0"
	class="backdrop bg-backdrop-light dark:bg-backdrop-dark prevent-default fixed top-0 flex h-screen w-screen items-center justify-center"
>
	<dialog
		class="bg-button-light dark:bg-button-dark relative m-auto flex max-h-[calc(100vh-40px)] min-h-[var(--challenge-dialog-height)] w-[var(--challenge-dialog-width)] flex-col items-center gap-5 rounded-md px-[var(--challenge-padding-inline)] py-2 pb-15"
		class:dark:bg-challenge-solved-dark={challenge_data.solved || form?.success}
		class:bg-challenge-solved-light={challenge_data.solved || form?.success}
	>
		<section class="top flex w-full flex-col items-center">
			<h3
				class="challenge-title text-foreground-light dark:text-foreground-dark px-4 pt-5 pb-2 text-5xl"
				class:dark:text-background-dark={challenge_data.solved}
				class:text-background-light={challenge_data.solved}
			>
				{challenge_data.challenge_name}
			</h3>
			<ul class="categroies flex w-8/10 flex-row flex-wrap justify-center">
				{#each categories.filter((_, index) => challenge_data.challenge_sub_categories
							.split('')
							.reverse()
							.join('')[index] === '1') as category}
					<li
						class="bg-foreground-light dark:bg-foreground-dark text-background-light dark:text-background-dark rounded-md px-2 py-1 text-xs"
					>
						{category}
					</li>
				{/each}
			</ul>
			<div class="solve-stats text-foreground-dark mt-1 flex flex-row gap-5">
				<p
					class="points text-foreground-light dark:text-foreground-dark flex flex-row items-center gap-0.5"
				>
					<CirclePlus class="size-4"></CirclePlus>
					{challenge_data.points}
				</p>
				<p
					class="num-solves text-foreground-light dark:text-foreground-dark flex flex-row items-center gap-0.5"
				>
					<Flag class="size-4"></Flag>
					{challenge_data.num_solves}
				</p>
			</div>
		</section>
		<section
			class="middle text-foreground-dark flex h-full w-full flex-row justify-between gap-2 overflow-hidden px-4"
		>
			<p
				class="challenge-description text-foreground-light dark:text-foreground-dark mr-1 max-h-full w-1/2 overflow-scroll"
				class:text-background-light={challenge_data.solved}
			>
				{challenge_data.challenge_description}
			</p>
			<div class="right ml-1 flex w-1/2 flex-col gap-1">
				<div class="flex flex-col">
					<p class="font-bold">Resources:</p>
					<ul class="resources flex flex-col gap-0 pl-4">
						{#each challenge_data.resources as resource}
							{#if resource.type === 'web'}
								<li
									class="challenge-resource text-foreground-light dark:text-foreground-dark flex h-fit flex-row items-center gap-1 underline"
								>
									<Link class="size-4"></Link>
									<a href={resource.content} class="ignore-default h-fit">{resource.content}</a>
								</li>
							{:else if resource.type === 'file'}
								<li class="challenge-resource flex flex-row items-center gap-1">
									<File class="size-4"></File>
									<a href={resource.content} class="ignore-default h-fit"
										>{resource.content.split('/')[3]}</a
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
				<div class="author flex flex-row items-center gap-1">
					<UserRoundPen class="size-4"></UserRoundPen>
					<p class="font-bold">Author:</p>
					<p>{challenge_data.author ? challenge_data.author : 'Anonymous'}</p>
				</div>
				<div
					class="first-solvers-wrapper text-foreground-light dark:text-foreground-dark flex flex-col justify-start"
				>
					<h5 class="font-bold">First Solvers:</h5>
					<ol class="first-solvers flex list-inside list-decimal flex-col justify-start">
						{#each challenge_data.first_solvers as solver}
							<li class="solver">{solver.display_name}</li>
						{/each}
					</ol>
				</div>
			</div>
		</section>
		<section class="bottom absolute bottom-2 w-10/12">
			{#if form && form?.success}
				<span class="text-green-600">{translations.success}: {form.message}</span>
			{:else if form && !form?.success}
				<span class="text-red-600">{translations.failure}: {form.message}</span>
			{/if}
			{#if !challenge_data.solved}
				<form
					action="?/submit"
					method="POST"
					class="flag-submission-form flex w-full flex-row gap-1"
					use:enhance
				>
					<!-- <form
					action={`/api/submit/${challenge_data.challenge_id}`}
					method="POST"
					class="flag-submission-form flex w-full flex-row gap-1"
					use:enhance
				> -->

					<label
						for="flag"
						class="text-foreground-light dark:text-foreground-dark text-xl font-semibold"
						>Flag:</label
					>
					<input
						type="text"
						name="flag"
						class="flag bg-foreground-light dark:bg-foreground-dark text-background-light dark:text-background-dark w-full rounded-sm px-1"
						placeholder={challenge_data.flag_format}
					/>
					<input type="hidden" value={challenge_data.challenge_id} name="challenge_id" />
					<button
						aria-label="Submit flag"
						type="submit"
						class="submit-flag ignore-default bg-foreground-light dark:bg-foreground-dark h-8 w-8 rounded-sm p-0 text-center"
					>
						<div class="flex size-full items-center justify-center">
							<SendHorizontal />
						</div>
					</button>
				</form>
			{:else}
				<p
					class="rounded-lg border-4 border-neutral-400 bg-stone-700 py-2 text-center font-semibold text-stone-300"
				>
					Challenge Already Solved
				</p>
			{/if}
		</section>
	</dialog>
</div>
