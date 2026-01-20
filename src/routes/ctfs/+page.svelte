<script lang="ts">
    import CtfCard from '$lib/components/CtfCard.svelte';
    let { data } = $props();
    let translations = $derived(data.translations);
    let ctfs = $derived(data.ctfs);

    let ongoingCtfs = $derived(
        ctfs.filter((ctf) => {
            const currentTime = new Date();
            return ctf.start_time < currentTime && currentTime < ctf.end_time;
        })
    );
    let upcomingCtfs = $derived(
        ctfs.filter((ctf) => {
            const currentTime = new Date();
            return currentTime < ctf.start_time;
        })
    );
    let pastCtfs = $derived(
        ctfs.filter((ctf) => {
            const currentTime = new Date();
            return ctf.end_time < currentTime;
        })
    );

    let scroller: HTMLDivElement;

    function onWheel(e: WheelEvent) {
        if (e.deltaY !== 0) {
            e.preventDefault();
            scroller.scrollLeft += e.deltaY;
        }
    }
</script>

<div
    class="scrollbar-hidden flex w-full flex-row gap-16 overflow-x-auto overflow-y-hidden pt-24 whitespace-nowrap"
    bind:this={scroller}
    onwheel={onWheel}>
    <section>
        <p class="text-text-150 mb-4 ml-1 text-[18px]">
            {translations.current_ctfs}
        </p>
        {#if ongoingCtfs.length > 0}
            <ul class="flex gap-8">
                {#each ongoingCtfs as ongoingCtf (ongoingCtf.id)}
                    <CtfCard ctfData={ongoingCtf} />
                {/each}
            </ul>
        {:else}
            <div class="mt-4 ml-2 flex w-fit flex-row text-gray-500">
                <p class="">
                    {translations.nothing_here_yet}
                </p>
            </div>
        {/if}
    </section>
    <section>
        <p class="text-text-150 mb-4 ml-1 text-[18px]">
            {translations.upcoming_ctfs}
        </p>
        {#if upcomingCtfs.length > 0}
            <ul class="flex gap-8">
                {#each upcomingCtfs as upcomingCtf (upcomingCtf.id)}
                    <CtfCard ctfData={upcomingCtf} />
                {/each}
            </ul>
        {:else}
            <div class="mt-4 ml-2 flex w-fit flex-row text-gray-500">
                <p class="">
                    {translations.nothing_here_yet}
                </p>
            </div>
        {/if}
    </section>
    <section class="opacity-55">
        <p class="text-text-150 mb-4 ml-1 text-[18px]">
            {translations.past_ctfs}
        </p>
        {#if pastCtfs.length > 0}
            <ul class="flex gap-8">
                {#each pastCtfs as pastCtf (pastCtf.id)}
                    <CtfCard ctfData={pastCtf} />
                {/each}
            </ul>
        {:else}
            <div class="mt-4 ml-2 flex w-fit flex-row text-gray-500">
                <p class="">
                    {translations.nothing_here_yet}
                </p>
            </div>
        {/if}
    </section>
</div>
