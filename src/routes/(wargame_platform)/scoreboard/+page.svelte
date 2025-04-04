<script>
	let { data } = $props();
	let { users_scoreboard, classes_scoreboard } = data;

	let original_classes = classes_scoreboard.map((class_obj) => class_obj.class_name);
	let include_classes = $state(original_classes);
</script>

<div class="content">
	<h1 class="route-title">Scoreboards</h1>
	<div class="scoreboards grid grid-cols-2 grid-rows-[fit_1fr] items-start gap-x-10">
		<!-- <div class="scoreboards grid grid-cols-[repeat(auto-fit,minmax(fit,1fr))] gap-x-10 items-start"> -->
		<div class="mb-2 flex flex-col justify-between">
			<h3 class="scoreboard-title text-5xl">Users:</h3>
			<div
				class="class-filtering flex w-full flex-row flex-wrap items-end justify-start gap-1 text-center align-middle"
			>
				{#each original_classes as _class}
					<div
						class="rounded-sm bg-neutral-500 px-1 text-sm text-neutral-100 dark:bg-neutral-600"
						class:bg-neutral-800={!include_classes.includes(_class)}
						class:text-neutral-300={!include_classes.includes(_class)}
						class:dark:bg-neutral-200={!include_classes.includes(_class)}
						class:dark:text-neutral-800={!include_classes.includes(_class)}
					>
						<label class="h-full pr-0.5 align-text-bottom" for={_class}>{_class}</label><input
							class="peer bg-grey-dark dark:bg-dim-beige checked:bg-accent-light dark:checked:bg-accent-dark h-3 w-3 appearance-none rounded-sm"
							type="checkbox"
							id={_class}
							bind:group={include_classes}
							value={_class}
						/>
					</div>
				{/each}
			</div>
		</div>
		<div class="mb-2 flex flex-col justify-between">
			<h3 class="scoreboard-title text-5xl">Classes:</h3>
		</div>
		<table class="min-w-20 overflow-scroll">
			<thead>
				<tr
					class=" border-b-accent-light dark:border-b-accent-dark my-10 w-fit min-w-20 border-b-1"
				>
					<th class="w-1 px-2 text-left font-bold uppercase">#</th>
					<th class="w-1 px-2 text-left font-bold uppercase">Username</th>
					<th class="w-1 px-4 text-center font-bold uppercase">Class</th>
					<th class="w-1 px-2 text-right font-bold uppercase">Score</th>
				</tr>
			</thead>
			<tbody>
				{#each users_scoreboard
					.filter((user) => {
						if (user.represents_class) return include_classes.includes(user.represents_class);
					})
					.slice(0, 15) as player, i}
					<tr
						class="border-b-accent-light dark:border-b-accent-dark outline-accent-dark w-fit border-b-1 text-wrap break-words"
					>
						<td class="mt-2 h-12 px-2 text-left">{i + 1}</td>
						<td class="mt-2 h-12 px-2 text-left break-words"><a href={`/user/${player.id}`}>{player.display_name}</a></td>
						<td class="mt-2 h-12 px-4 text-center">{player.represents_class}</td>
						<td class="mt-2 h-12 px-2 text-right"
							>{player.total_points == null ? 0 : player.total_points}</td
						>
					</tr>
				{/each}
			</tbody>
		</table>

		<table class="min-w-20 overflow-scroll">
			<thead>
				<tr
					class=" border-b-accent-light dark:border-b-accent-dark my-10 w-fit min-w-20 border-b-1"
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
		</table>
	</div>
</div>
