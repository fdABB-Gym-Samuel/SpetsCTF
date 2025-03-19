<script lang="ts">
	// import { derived } from "svelte/store";
	let { title, type } = $props();
	let players = $state([
		{
			username: 'Regnm0ln1',
			score: Math.floor(Math.random() * 10000),
			class: '200S',
			school: 'Hitachigymnasiet Västerås'
		},
		{
			username: 'Eritho',
			score: Math.floor(Math.random() * 10000),
			class: '180S',
			school: 'Hitachigymnasiet Västeråsllllllllllllllll'
		},
		{
			username: 'Agartha Warriors',
			score: Math.floor(Math.random() * 10000),
			class: '2301',
			school: 'Hitachigymnasiet Västerås'
		},
		{
			username: 'ZebrasNotHorses',
			score: Math.floor(Math.random() * 10000),
			class: '230S',
			school: 'Hitachigymnasiet Västerås'
		},
		{
			username: 'Black Mesa',
			score: Math.floor(Math.random() * 10000),
			class: '220S',
			school: 'Hitachigymnasiet Västerås'
		},
		{
			username: 'Vår Herres Knektar Vår Herres Knektar',
			score: Math.floor(Math.random() * 10000),
			class: '2202',
			school: 'Hitachigymnasiet Västerås'
		},
		{
			username: 'Bra Fråga',
			score: Math.floor(Math.random() * 10000),
			class: '230S',
			school: 'Hitachigymnasiet Västerås'
		},
		{
			username: 'IanTerzo',
			score: Math.floor(Math.random() * 10000),
			class: '230S',
			school: 'Hitachigymnasiet Västerås'
		},
		{
			username: 'Nils Nachname',
			score: Math.floor(Math.random() * 10000),
			class: '230S',
			school: 'Hitachigymnasiet Västerås'
		}
	]);

	const include_schools = $derived([...new Set(players.map((obj) => obj.school))]);
	let original_classes = [...new Set(players.map((obj) => obj.class))];
	let include_classes = $state([...new Set(players.map((obj) => obj.class))]);

	let sorted_players = $derived.by(() => {
		return [...players]
			.sort((a, b) => b.score - a.score)
			.filter((player) => {
				return include_schools.includes(player.school) && include_classes.includes(player.class);
			});
	});
</script>

<div class="scoreboard flex h-full min-w-fit flex-grow-1 flex-col justify-center pt-4">
	<div class="mb-2 flex flex-col justify-between">
		<h3 class="scoreboard-title text-5xl">{title}:</h3>
		{#if type === 'users'}
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
		{/if}
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
			{#each sorted_players as player, i}
				<tr
					class="w-fit border-b-1 border-b-[var(--color-accent-dark)] text-wrap break-words outline-[var(--color-accent-dark)]"
				>
					<td class="mt-2 h-12 px-2 text-left">{i + 1}</td>
					<td class="mt-2 h-12 px-2 text-left break-words">{player.username}</td>
					<!-- <td class="px-4 h-12 mt-2 text-left">{player.school}</td> -->
					<td class="mt-2 h-12 px-4 text-center">{player.class}</td>
					<td class="mt-2 h-12 px-2 text-right">{player.score}</td>
				</tr>
			{/each}
		</tbody>
	</table>
	{#if type === 'users'}
		<div class="h-full"></div>
	{/if}
</div>
