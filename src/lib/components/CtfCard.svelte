<script lang="ts">
    import { resolve, asset } from '$app/paths';

    import IconArrowUpRightBold from 'phosphor-icons-svelte/IconArrowUpRightBold.svelte';

    import type { CtfEvents } from '$lib/generated/db.d.ts';
    import type { Selectable } from 'kysely';
    interface Props {
        ctfData: Selectable<CtfEvents>;
        // organizers?: Selectable<Users>[];
        // teams?: Selectable<CtfTeams>[];
    }

    let { ctfData }: Props = $props();

    let startDateText = $derived(new Date(ctfData.start_time).toLocaleDateString());
    let startTimeText = $derived(
        new Date(ctfData.start_time).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        })
    );
    let endDateText = $derived(new Date(ctfData.end_time).toLocaleDateString());
    let endTimeText = $derived(
        new Date(ctfData.end_time).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        })
    );

    // let numberOfTeams = $derived(teams?.length);

    // let displayedOrganizerNames = $derived(
    // 	organizers
    // 		?.sort((a, b) => {
    // 			if (a.is_admin && !b.is_admin) {
    // 				return -1;
    // 			} else if (!a.is_admin && b.is_admin) {
    // 				return 1;
    // 			} else {
    // 				return 0;
    // 			}
    // 		})
    // 		.map((organizer) => {
    // 			if (organizer.display_name) {
    // 				return organizer.display_name;
    // 			} else {
    // 				return organizer.github_username;
    // 			}
    // 		}),
    // );
</script>

<a
    href={resolve('/(ctf_platform)/ctf/[ctfId=ctfId]', {
        ctfId: String(ctfData.id),
    })}>
    <article
        class="bg-bg-800 hover:bg-bg-700 relative h-144 min-h-fit w-102 max-w-full rounded-[10px] px-6 py-8 transition-colors">
        <div class="relative z-10 flex h-full flex-col justify-between">
            <div class="">
                <h3
                    class="text-text-150 flex w-full items-center justify-between text-[22px] font-semibold">
                    {ctfData.display_name}
                    <IconArrowUpRightBold class="text-[26px]" />
                </h3>
            </div>
            <div class="mb-2">
                <p class="text-text-150 mb-4 text-sm">
                    {startDateText}
                    {startTimeText}<br />to {endDateText}
                    {endTimeText}
                </p>
                <div class="flex justify-between">
                    <img src={asset('/assets/ctf-banner/2.svg')} alt="" />
                    <img src={asset('/assets/ctf-banner/6.svg')} alt="" />
                </div>

                <!-- {#if teams && !isNaN(numberOfTeams ?? NaN)} -->
                <!-- 	<p class="font-mono text-sm font-bold"> -->
                <!-- 		{numberOfTeams} -->
                <!-- 		{#if numberOfTeams === 1} -->
                <!-- 			team -->
                <!-- 		{:else} -->
                <!-- 			teams -->
                <!-- 		{/if} -->
                <!-- 	</p> -->
                <!-- {/if} -->
            </div>
            <!-- {#if organizers && displayedOrganizerNames} -->
            <!-- 	<section class="justify arounditems-center flex"> -->
            <!-- 		<p>Hosted by</p> -->
            <!-- 		<ul class="categroies flex w-full flex-row flex-wrap"> -->
            <!-- 			{#each displayedOrganizerNames as name, index (index)} -->
            <!-- 				<li -->
            <!-- 					class="text-text-100 px-4 py-1 text-xs -->
            <!--          {index === 0 ? 'bg-gradient-100 rounded-l-xl rounded-bl-xl' : ''} -->
            <!--          {index === 1 ? 'bg-gradient-200' : ''} -->
            <!--          {index === 2 ? 'bg-gradient-300 rounded-r-xl rounded-br-xl' : ''} -->
            <!--          {index === displayedOrganizerNames.length - 1 -->
            <!-- 						? 'rounded-r-xl rounded-br-xl' -->
            <!-- 						: ''}" -->
            <!-- 				> -->
            <!-- 					<p class="text-text-100">{name}</p> -->
            <!-- 				</li> -->
            <!-- 			{/each} -->
            <!-- 		</ul> -->
            <!-- 	</section> -->
            <!-- {/if} -->
        </div>
    </article>
</a>
