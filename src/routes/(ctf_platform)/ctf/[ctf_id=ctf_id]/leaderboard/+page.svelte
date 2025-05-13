<script lang="ts">
	let { data } = $props();
	let { user, ctf, scores, team } = data;

	import BackToTop from '$lib/components/BackToTop.svelte';

	import { playAnimations } from '$lib/gsap/animations';
	import { onDestroy, onMount } from 'svelte';

	import { page } from '$app/state';

	let componentRoot: HTMLElement;
	let gsapContext: gsap.Context | undefined;

	let teamPosition = $state(scores.findIndex((team_) => team_.team_id === team?.teamId) + 1);

	onMount(() => {
		gsapContext = playAnimations(componentRoot);
	});

	onDestroy(() => {
		gsapContext?.revert();
	});
	console.log(scores);
</script>

<main class="content m-auto w-full max-w-[1200px] pt-20" bind:this={componentRoot}>
	{#if ctf?.end_time < new Date()}
		<section>
			<p>Imagine a beautiful podium here</p>
		</section>
	{/if}

	<!-- TODO: add header with user info if logged in -->
	{#if team && !user?.is_admin}
		<header class="gsap-top-down-opacity mb-12">
			<h1 class="text-xl font-bold">
				{team?.teamName} <span class="text-text-200">#{teamPosition}</span>
			</h1>
			<!-- <p class="text-text-200">
				You have <span class="text-text-100"
					>{scores.filter((user_) => user_.id === user.id)[0]?.total_points}pts</span
				>, currently in the
				<span class="text-text-100">#{userClassPosition} class</span>.
			</p> -->
		</header>
	{/if}
	<div class="scoreboards flex w-full flex-col gap-16">
		<section>
			<div
				class="bg-bg-850 gsap-top-down-opacity max-h-[600px] w-full min-w-20 overflow-auto rounded-lg px-8 py-4"
			>
				{#if scores.length > 0}
					<table class="gsap-top-down-opacity w-full table-fixed">
						<thead>
							<tr
								class="*:bg-bg-800 min-w-20 *:py-2 [&>th:first-child]:rounded-l-lg [&>th:last-child]:rounded-r-lg"
							>
								<th class="text-text-200 w-12 pl-4 text-left font-medium sm:w-18 sm:pl-10">#</th>
								<th class="text-text-200 w-fit text-left font-medium">Team Name</th>
								<th class="text-text-200 w-18 pr-4 text-right font-medium sm:w-24 sm:pr-10"
									>Score</th
								>
							</tr>
						</thead>
					</table>

					<div class="h-4"></div>
					<table class="gsap-top-down-opacity w-full table-fixed">
						<tbody>
							{#each scores as team_, i}
								<tr
									class="*:border-bg-700 max-h-12 w-full text-wrap break-words *:border-t-0 [&>th:first-child]:rounded-l-lg [&>th:last-child]:rounded-r-lg

                        {i === 0
										? 'text-primary'
										: i === 1
											? 'text-primary-light'
											: i === 2
												? 'text-primary-extra-light'
												: ''}"
									class:bg-bg-700={team && team.teamId === team_.team_id}
								>
									<td class="h-12 w-12 pl-4 text-left sm:w-18 sm:pl-10">{i + 1}</td>
									<td
										class="h-12 max-h-12 w-fit overflow-hidden text-left break-normal text-ellipsis"
										><a class="ignore-default" href={`team/${team_.team_id}`}>{team_.team_name}</a
										></td
									>
									<td class="h-12 w-18 pr-4 text-right sm:w-24 sm:pr-10"
										>{team_.total_points == null ? 0 : team_.total_points}</td
									>
								</tr>
							{/each}
						</tbody>
					</table>
				{/if}
			</div>
			<p class="text-text-200 gsap-top-down-opacity mt-2 ml-0.5">{scores.length} teams</p>
		</section>
	</div>
</main>
<BackToTop />
