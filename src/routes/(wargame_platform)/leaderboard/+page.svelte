<script lang="ts">
	let { data } = $props();
	let { users_scoreboard, classes_scoreboard } = data;

	let original_classes = classes_scoreboard.map((class_obj) => class_obj.className);
	let include_classes = $state(original_classes);

	let filtered_users = $derived(
		users_scoreboard
			.filter((user) => user.represents_class && include_classes.includes(user.represents_class))
			.slice(0, 15)
	);

	import BackToTop from '$lib/components/BackToTop.svelte';

	import { playAnimations } from '$lib/gsap/animations';
	import { onDestroy, onMount } from 'svelte';

	let componentRoot: HTMLElement;
	let gsapContext: gsap.Context | undefined;

	onMount(() => {
		gsapContext = playAnimations(componentRoot);
	});

	onDestroy(() => {
		gsapContext?.revert();
	});
</script>

<main class="content m-auto w-full max-w-[1200px] pt-24" bind:this={componentRoot}>
	<!-- TODO: add header with user info if logged in -->
	<header class="gsap-top-down-opacity mb-12">
		<h1 class="text-xl font-bold">Hannes <span class="text-text-200">#10</span></h1>
		<p class="text-text-200">
			You have <span class="text-text-100"
				>{users_scoreboard.filter((user_) => user_.id === data.user.id)[0].total_points}</span
			>, currently in the
			<span class="text-text-100">#1 class</span>.
		</p>
	</header>
	<div class="scoreboards flex w-full flex-col gap-16">
		<section>
			<div class="mb-4 flex items-center justify-between">
				<h3 class="scoreboard-title gsap-top-down-opacity text-lg font-bold">Users</h3>
				<div
					class="class-filtering gsap-top-down-opacity flex flex-row flex-wrap items-center gap-1.5"
				>
					<p class="text-text-200 mr-2 text-sm">Filter:</p>
					{#each original_classes as cls}
						<label class="gsap-right-left-opacity relative cursor-pointer px-4 select-none">
							<input
								type="checkbox"
								bind:group={include_classes}
								value={cls}
								id={cls}
								class="peer sr-only"
							/>
							<span class="text-text-200 peer-checked:text-text-100 text-sm transition-colors"
								>{cls}</span
							>
							<span
								class="bg-bg-800 peer-checked:bg-bg-700 absolute top-0.5 left-0 -z-10 h-5.5 w-full rounded-lg transition-colors"
								aria-hidden="true"
							></span>
						</label>
					{/each}
				</div>
			</div>
			<div
				class="bg-bg-850 gsap-top-down-opacity max-h-[600px] w-full min-w-20 overflow-auto rounded-lg px-8 py-4"
			>
				{#if filtered_users.length === 0}
					<p class="text-center text-sm text-red-500">
						No users, please toggle at least one class.
					</p>
				{:else}
					<table class="gsap-top-down-opacity w-full table-fixed">
						<thead>
							<tr
								class="*:bg-bg-800 min-w-20 *:py-2 [&>th:first-child]:rounded-l-lg [&>th:last-child]:rounded-r-lg"
							>
								<th class="text-text-200 w-8 text-left font-medium">#</th>
								<th class="text-text-200 w-fit text-left font-medium">Username</th>
								<th class="text-text-200 w-fit text-center font-medium">Class</th>
								<th class="text-text-200 w-16 text-right font-medium">Score</th>
							</tr>
						</thead>
					</table>

					<div class="h-4"></div>
					<table class="gsap-top-down-opacity w-full table-fixed">
						<tbody>
							{#each filtered_users as player, i}
								<tr
									class="*:border-bg-700 w-full text-wrap break-words *:border-t-0
                        {i ===
									users_scoreboard
										.filter(
											(user) =>
												user.represents_class && include_classes.includes(user.represents_class)
										)
										.slice(0, 15).length -
										1
										? ''
										: '*:border-b-3'}
                        {i === 0
										? 'text-primary'
										: i === 1
											? 'text-primary-light'
											: i === 2
												? 'text-primary-extra-light'
												: ''}"
								>
									<td class="h-12 w-8 text-left">{i + 1}</td>
									<td class="h-12 w-fit text-left break-words"
										><a class="ignore-default" href={`/user/${player.id}`}>{player.display_name}</a
										></td
									>
									<td class="h-12 w-fit text-center">{player.represents_class}</td>
									<td class="h-12 w-16 text-right"
										>{player.total_points == null ? 0 : player.total_points}</td
									>
								</tr>
							{/each}
						</tbody>
					</table>
				{/if}
			</div>
			<p class="text-text-200 gsap-top-down-opacity mt-2 ml-0.5">{users_scoreboard.length} users</p>
		</section>

		<section>
			<h3 class="scoreboard-title gsap-top-down-opacity mb-4 text-lg font-bold">Classes</h3>
			<div
				class="bg-bg-850 gsap-top-down-opacity max-h-[300px] w-full min-w-20 overflow-auto rounded-lg px-8 py-4"
			>
				<!-- header only -->
				<table class="gsap-top-down-opacity w-full table-fixed">
					<thead>
						<tr
							class="*:bg-bg-800 min-w-20 *:px-10 *:py-2
                     [&>th:first-child]:rounded-l-lg
                     [&>th:last-child]:rounded-r-lg"
						>
							<th class="text-text-200 w-1/6 text-left font-medium">#</th>
							<th class="text-text-200 w-4/6 text-left font-medium">Class</th>
							<th class="text-text-200 w-1/6 text-right font-medium">Score</th>
						</tr>
					</thead>
				</table>

				<div class="h-4"></div>

				<!-- body only -->
				<table class="gsap-top-down-opacity w-full table-fixed">
					<tbody>
						{#each classes_scoreboard as curr_class, i}
							<tr
								class="*:border-bg-700 w-full text-wrap break-words
                       *:border-t-0
                       {i === classes_scoreboard.length - 1 ? '' : '*:border-b-3'}
                       {i === 0 ? 'text-secondary' : ''}"
							>
								<td class="h-12 w-1/6 px-2 pl-10 text-left">{i + 1}</td>
								<td class="h-12 w-fit px-2 pl-10 text-left break-words">
									{curr_class.className}
								</td>
								<td class="h-12 w-fit pr-10 text-right">
									{curr_class.totalPoints}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</section>

		<!-- <table class="min-w-20 overflow-scroll">
			<thead>
				<tr
					class=" border-b-accent-light dark:border-b-accent-dark my-10 w-fit min-w-20 border-b-1 "
				>
					<th class="w-1 px-2 text-left font-bold uppercase">#</th>
					<th class="w-1 px-2 text-left font-bold uppercase">Class</th>
					<th class="w-1 px-2 text-right font-bold uppercase">Score</th>
				</tr>
			</thead>
			<tbody>
				{#each classes_scoreboard as curr_class, i}
					<tr
						class="border-b-accent-light dark:border-b-accent-dark outline-accent-dark w-fit border-b-1 text-wrap break-words"
					>
						<td class="mt-2 h-12 px-2 text-left">{i + 1}</td>
						<td class="mt-2 h-12 px-2 text-left break-words">{curr_class.class_name}</td>
						<td class="mt-2 h-12 px-2 text-right">{curr_class.total_points}</td>
					</tr>
				{/each}
			</tbody>
		</table> -->
	</div>
</main>
<BackToTop />
