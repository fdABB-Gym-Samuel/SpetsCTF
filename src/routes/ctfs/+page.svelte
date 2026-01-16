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
</script>

<div class="content flex flex-col gap-5">
    <div>
        <h1 class="text-3xl font-bold">{translations.ctf_events}</h1>
    </div>
    <section>
        <h3 class="text-2xl">{translations.current_ctfs}</h3>
        {#if ongoingCtfs.length > 0}
            <ul>
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
        <h3 class="text-2xl">{translations.upcoming_ctfs}</h3>
        {#if upcomingCtfs.length > 0}
            <ul>
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
    <section>
        <h3 class="text-2xl">{translations.past_ctfs}</h3>
        {#if pastCtfs.length > 0}
            <ul>
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
