<script lang="ts">
	import { resolve } from "$app/paths";
	
  import type { CtfEvents, CtfTeams, Users } from "$lib/generated/db.d.ts";
  import type { Selectable } from "kysely";
	interface Props {
    ctfData: Selectable<CtfEvents>;
    organizers?: Selectable<Users>[];
    teams?: Selectable<CtfTeams>[];
	};

	let {ctfData, organizers, teams}: Props = $props();

	let startDateText = $derived(new Date(ctfData.start_time).toLocaleDateString())
	let startTimeText = $derived(new Date(ctfData.start_time).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}))
	let endDateText = $derived(new Date(ctfData.end_time).toLocaleDateString())
	let endTimeText = $derived(new Date(ctfData.end_time).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}))

	let numberOfTeams = $derived(teams?.length);

	let displayedOrganizerNames = $derived(
		organizers?.sort((a, b) => {
		if (a.is_admin && !b.is_admin) {
			return -1
		} else if (!a.is_admin && b.is_admin) {
			return 1
		} else {
			return 0
		}
	}).map((organizer) => {
		if (organizer.display_name) {
			return organizer.display_name
		} else {
			return organizer.github_username
		}
	})
	)
</script>

<a href={resolve('/(ctf_platform)/ctf/[ctf_id=ctf_id]', {ctf_id: String(ctfData.id)})}>
<article
	class="card challenge-cards bg-bg-800 before:bg-bg-750 relative h-full min-h-fit max-w-full overflow-hidden rounded-lg px-10
  py-6 before:absolute before:inset-0 before:origin-center before:scale-0 before:rounded-lg before:transition-transform
  before:duration-500 before:ease-out before:content-[''] hover:before:scale-100"
>
	<div class="relative z-10 flex h-full flex-col justify-between">
		<section class="top *:flex *:items-center *:justify-between">
			<div class="flex !items-start justify-start">
				<h3 class="challenge-name text-[18px] font-bold">
					{ctfData.display_name}
				</h3>
			</div>
			<div class="mt-2 mb-4">
				<p class="font-mono text-sm font-bold">
					{startDateText} {startTimeText} - {endDateText} {endTimeText}
				</p>
				{#if teams && !isNaN(numberOfTeams ?? NaN)}
				<p class="font-mono text-sm font-bold">
					{numberOfTeams}
					{#if numberOfTeams === 1}
						team
					{:else}
						teams
					{/if}
				</p>
				{/if}
			</div>
		</section>
		{#if organizers && displayedOrganizerNames}
		<section class="justify arounditems-center flex">
			<p>Hosted by</p>
			<ul class="categroies flex w-full flex-row flex-wrap">
				{#each displayedOrganizerNames as name, index (index)}
					<li
						class="text-text-100 px-4 py-1 text-xs
            {index === 0 ? 'bg-gradient-100 rounded-l-xl rounded-bl-xl' : ''}
            {index === 1 ? 'bg-gradient-200' : ''}
            {index === 2 ? 'bg-gradient-300 rounded-r-xl rounded-br-xl' : ''}
            {index === displayedOrganizerNames.length - 1 ? 'rounded-r-xl rounded-br-xl' : ''}"
					>
						<p class="text-text-100">{name}</p>
					</li>
				{/each}
			</ul>
		</section>
		{/if}
	</div>
</article>
</a>
