<script>
	// import Scoreboard from '../../components/scoreboard.svelte';
	let { data } = $props();
	let { users_scoreboard, classes_scoreboard } = data;

	let original_classes = classes_scoreboard.map((class_obj) => class_obj.class_name);
	let include_classes = $state(original_classes);
</script>

<div class="mx-[var(--main-padding-inline)]">
	<h1 class="route-title">Scoreboards</h1>
	<div class="flex max-w-screen min-w-fit flex-row flex-wrap items-end justify-stretch gap-10">
		<div class="user-leaderboard max-w-screen min-w-fit flex-1">
			<div class="scoreboard flex h-full min-w-fit flex-grow-1 flex-col justify-center pt-4">
				<div class="mb-2 flex flex-col justify-between">
					<h3 class="scoreboard-title text-5xl">Users:</h3>
					<div
						class="class-filtering flex w-full flex-row flex-wrap items-end justify-start gap-1 text-center align-middle"
					>
						{#each original_classes as _class}
							<div
								class="rounded-sm bg-neutral-600 px-1 text-sm text-neutral-200"
								class:bg-neutral-800={!include_classes.includes(_class)}
								class:text-neutral-400={!include_classes.includes(_class)}
							>
								<label class="h-full pr-0.5 align-text-bottom" for={_class}>{_class}</label><input
									class="peer bg-dim-beige checked:bg-accent-dark h-3 w-3 appearance-none rounded-sm"
									type="checkbox"
									id={_class}
									bind:group={include_classes}
									value={_class}
								/>
							</div>
						{/each}
					</div>
				</div>
				<!-- <ol class="scoreboard flex flex-col list-decimal list-inside"> -->
				<table class="overflow-scroll">
					<thead>
						<tr class=" my-10 w-fit border-b-1 border-b-[var(--color-accent-dark)]">
							<th class="w-1 px-2 text-left font-bold uppercase">#</th>
							<th class="w-1 px-2 text-left font-bold uppercase">Username</th>
							<!-- <th class="px-4 uppercase font-bold text-left w-fit">School</th> -->
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
								class="w-fit border-b-1 border-b-[var(--color-accent-dark)] text-wrap break-words outline-[var(--color-accent-dark)]"
							>
								<td class="mt-2 h-12 px-2 text-left">{i + 1}</td>
								<td class="mt-2 h-12 px-2 text-left break-words">{player.display_name}</td>
								<!-- <td class="px-4 h-12 mt-2 text-left">{player.school}</td> -->
								<td class="mt-2 h-12 px-4 text-center">{player.represents_class}</td>
								<td class="mt-2 h-12 px-2 text-right">{player.total_points}</td>
							</tr>
						{/each}
					</tbody>
				</table>
				<div class="h-full"></div>
			</div>
		</div>
		<div class="class-leaderboard max-w-screen min-w-fit flex-1">
			<div class="scoreboard flex h-full min-w-fit flex-grow-1 flex-col justify-center pt-4">
				<div class="mb-2 flex flex-col justify-between">
					<h3 class="scoreboard-title text-5xl">Classes:</h3>
				</div>
				<!-- <ol class="scoreboard flex flex-col list-decimal list-inside"> -->
				<table class="overflow-scroll">
					<thead>
						<tr class=" my-10 w-fit border-b-1 border-b-[var(--color-accent-dark)]">
							<th class="w-1 px-2 text-left font-bold uppercase">#</th>
							<th class="w-1 px-2 text-left font-bold uppercase">Class</th>
							<!-- <th class="px-4 uppercase font-bold text-left w-fit">School</th> -->
							<!-- <th class="w-1 px-4 text-center font-bold uppercase">Class</th> -->
							<th class="w-1 px-2 text-right font-bold uppercase">Score</th>
						</tr>
					</thead>
					<tbody>
						{#each classes_scoreboard as curr_class, i}
							<tr
								class="w-fit border-b-1 border-b-[var(--color-accent-dark)] text-wrap break-words outline-[var(--color-accent-dark)]"
							>
								<td class="mt-2 h-12 px-2 text-left">{i + 1}</td>
								<td class="mt-2 h-12 px-2 text-left break-words">{curr_class.class_name}</td>
								<!-- <td class="px-4 h-12 mt-2 text-left">{player.school}</td> -->
								<!-- <td class="mt-2 h-12 px-4 text-center">{player.represents_class}</td> -->
								<td class="mt-2 h-12 px-2 text-right">{curr_class.total_points}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
</div>
