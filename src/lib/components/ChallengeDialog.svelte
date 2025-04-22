<script lang="ts">
	import { Link, SquareTerminal, Copy, File, UserRoundPen, CircleX } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { page } from '$app/state';

  import { capitalizeFirstLetter } from '$lib/utils/utils';

  import { playAnimations } from '$lib/gsap/animations';

  import Button from './Button.svelte';
	import { onMount, onDestroy } from 'svelte';

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
		translations
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

  function getPointColor(points: number): string {
    const colorRanges = [
      { min: 0, max: 199, class: 'text-point-100' },
      { min: 200, max: 299, class: 'text-point-200' },
      { min: 300, max: 399, class: 'text-point-300' },
      { min: 400, max: 499, class: 'text-point-400' },
      { min: 500, max: 599, class: 'text-point-500' },
    ];

    for (const range of colorRanges) {
      if (points >= range.min && points <= range.max) {
        return range.class;
      }
    }

    return 'text-text-100';
  }

  let filteredCategories = categories.filter((_, index) =>
		challenge_data.challenge_sub_categories
			.split('')
			.reverse()
			.join('')[index] === '1'
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
  let componentRoot : HTMLElement;

  onMount(() => {
    gsapContext = playAnimations(componentRoot)

    keydownHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape' || e.key === 'Enter') {
      closeDialog();
    }
  };

    document.addEventListener('keydown', keydownHandler);
  })

  onDestroy(() => {
    gsapContext?.revert();

    if (keydownHandler) {
      document.removeEventListener('keydown', keydownHandler);
    }
  })
</script>

<div
  bind:this={componentRoot}
	class="backdrop bg-overlay prevent-default fixed top-0 left-0 flex h-screen w-screen items-center justify-center pb-32"
>
  <button
  type="button"
  class="absolute inset-0 w-full h-full cursor-default focus:outline-none"
  onclick={(e) => {
    if (e.currentTarget === e.target) {
      closeDialog();
    };
  }}
  aria-label="Close challenge details"
  ></button>
	<dialog
		class="bg-bg-800 rounded-lg relative m-auto flex w-[85%] max-w-[1000px] flex-col px-16 py-12 gsap-opacity"
		class:dark:bg-challenge-solved-dark={challenge_data.solved}
		class:bg-challenge-solved-light={challenge_data.solved}
	>
    <section class="-mt-2 mb-12 flex w-full justify-between">
      <!-- TODO: add field for date -->
      <p class="font-mono mb-0.5 text-sm font-bold text-primary-light">Uploaded 2025-03-04</p>
      <button type="button" onclick={() => closeDialog()} class="cursor-pointer">
        <CircleX color="var(--color-text-200)" size=20 class="hover:stroke-text-100 transition-colors" />
      </button>
    </section>
		<section class="top flex w-full items-center justify-between mb-6">
      <h3
        class="challenge-name text-text-100 text-xl font-bold"
        class:dark:text-background-dark={challenge_data.solved}
        class:text-background-light={challenge_data.solved}
      >
        {challenge_data.challenge_name}
      </h3>

		</section>
		<section
			class="middle text-foreground-dark flex h-full w-full flex-row justify-between gap-2 overflow-hidden mb-24"
		>
      <div class="w-1/2">
        <div class="flex flex-col mb-8">
					<p class="text-text-200">Resources:</p>
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
        <div class="author mb-2">
					<UserRoundPen class="inline-block mb-0.5" color="var(--color-text-200)" size=16></UserRoundPen>
					<p class="inline-block text-text-200 text-sm">Author:&nbsp;</p>
					<p class="inline-block font-bold text-sm">{challenge_data.author ? challenge_data.author : 'Anonymous'}</p>
				</div>
        <p
				class="challenge-description text-foreground-light dark:text-foreground-dark mr-1 max-h-full overflow-scroll"
				class:text-background-light={challenge_data.solved}
        >
          {challenge_data.challenge_description}
        </p>
      </div>
			<div class="right w-1/2">
        {#if !challenge_data.solved}
          <form
            action={`/api/submit/${challenge_data.challenge_id}`}
            method="POST"
            class="flag-submission-form"
            use:enhance
          >
            <label
              for="flag"
              class="text-sm"
              >Submit flag</label
            >
            <div class="relative mt-2 mb-8">
              <input
                type="text"
                name="flag"
                class="flag w-full px-6 py-1.5 font-mono bg-bg-600 rounded-xl focus:outline-none"
                placeholder={challenge_data.flag_format}
              />
              <div class="absolute right-0 top-1/2 transform -translate-y-1/2">
                <Button label="Submit" type="submit" ariaLabel="Submit flag" bgColor="bg-bg-500" outlineColor="outline-transparent" hoverColor="hover:bg-secondary" />
              </div>
            </div>
          </form>
        {:else}
          <p
            class="rounded-lg border-4 border-neutral-400 bg-stone-700 py-2 text-center font-semibold text-stone-300"
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
		<section class="flex justify-between w-full">
      <ul class="categroies flex w-full flex-row flex-wrap">
        {#each filteredCategories as category, index}
          <li
            class="text-text-100 px-7 py-1 text-xs
            {index === 0 ? "bg-gradient-100 rounded-l-xl rounded-bl-xl" : ""}
            {index === 1 ? "bg-gradient-200" : ""}
            {index === 2 ? "bg-gradient-300" : ""}
            {index === filteredCategories.length - 1 ? "rounded-r-xl rounded-br-xl" : ""}"
          >
            <p># {capitalizeFirstLetter(category)}</p>
          </li>
        {/each}
      </ul>
      <div class="flex flex-row gap-10">
        <p class="font-mono text-sm font-bold {getPointColor(challenge_data.points)}">{challenge_data.points}&nbsp;&nbsp;<span class="text-text-200">POINTS</span></p>
        <p class="font-mono text-sm font-bold text-text-100">{challenge_data.num_solves}&nbsp;&nbsp;<span class="text-text-200">SOLVERS</span></p>
      </div>
		</section>
	</dialog>
</div>
