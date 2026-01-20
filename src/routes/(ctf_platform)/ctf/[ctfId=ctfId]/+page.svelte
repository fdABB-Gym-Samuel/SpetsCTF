<script lang="ts">
    let { data } = $props();
    let ctfData = $derived(data.ctfData);
    import { Spring } from 'svelte/motion';

    import { page } from '$app/state';
    import { Swords } from '@lucide/svelte';

    import { onMount, onDestroy } from 'svelte';
    import { goto } from '$app/navigation';

    import HSeperator from '$lib/components/HSeperator.svelte';
    import Button from '$lib/components/Button.svelte';
    import { resolve } from '$app/paths';
    // import type { H } from 'vitest/dist/chunks/environment.d8YfPkTm.js';

    let countdown = $state({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    let started = $state(false);
    let ended = $state(false);
    type Timeout = ReturnType<typeof setInterval>;
    let interval: Timeout;

    function updateCountdown(): void {
        if (ctfData === undefined || ctfData === null) {
            countdown = { days: 0, hours: 0, minutes: 0, seconds: 0 };
            return;
        }
        const now = new Date();
        let diff = ctfData.start_time.getTime() - now.getTime();

        if (diff <= 0) {
            started = true;
            diff = ctfData.end_time.getTime() - now.getTime();
        }
        if (diff <= 0) {
            ended = true;
        }

        const totalSeconds = Math.floor(diff / 1000);
        const days = Math.floor(totalSeconds / (3600 * 24));
        const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        countdown = { days, hours, minutes, seconds };
    }

    let countdownContainer: HTMLElement;
    const maxRotate: number = 1;

    const rotX = new Spring(0, { stiffness: 0.15, damping: 0.8 });
    const rotY = new Spring(0, { stiffness: 0.15, damping: 0.8 });

    function handleMouseMove(event: MouseEvent): void {
        const rect = countdownContainer.getBoundingClientRect();
        const xRel = event.clientX - (rect.left + rect.width / 2);
        const yRel = event.clientY - (rect.top + rect.height / 2);
        // Normalize to range [-1, 1]
        const xNorm = xRel / (rect.width / 2);
        const yNorm = yRel / (rect.height / 2);
        // Smoothly tween to the new rotation
        rotY.target = xNorm * maxRotate;
        rotX.target = -yNorm * maxRotate;
    }

    function handleMouseLeave() {
        // Reset back to flat
        rotX.target = 0;
        rotY.target = 0;
    }

    onMount(() => {
        updateCountdown();
        interval = setInterval(updateCountdown, 1000);
    });

    onDestroy(() => {
        clearInterval(interval);
    });
</script>

<svelte:body on:mousemove={handleMouseMove} on:mouseleave={handleMouseLeave} />

<main class="m-auto flex max-w-[520px] flex-col items-center justify-center pt-48">
    <h1 class="text-3xl font-bold">
        {ctfData?.display_name}
    </h1>
    <div class="w-full perspective-midrange">
        <article
            bind:this={countdownContainer}
            class="mt-12 w-full will-change-transform transform-3d">
            {#if !started}
                <p class="text-text-200 mb-2 text-sm">CTF starts in</p>
            {:else if !ended}
                <p class="text-text-200 mb-2 text-sm">CTF ends in</p>
            {/if}
            {#if !ended}
                <div class="rounded-lg shadow-xl">
                    <div
                        class="bg-bg-800 inner-shadow flex items-center justify-between rounded-lg px-10 py-2 pb-3 select-none">
                        {#each Object.entries(countdown) as [label, number], index (index)}
                            <div class="flex flex-col items-center">
                                <p class="-mb-2 flex-1 text-center text-lg">{number}</p>
                                <p class="text-text-200 text-sm">{label}</p>
                            </div>
                            {#if index !== Object.entries(countdown).length - 1}
                                <div class="h-5">
                                    <HSeperator color="bg-bg-600" />
                                </div>
                            {/if}
                        {/each}
                    </div>
                </div>
            {/if}
        </article>
        {#if ended}
            <p class="text-center">CTF has ended</p>
        {:else}
            <div class="mt-24 text-center">
                <Button
                    label="See Challenges"
                    type="button"
                    onclick={() =>
                        goto(
                            resolve(`/(ctf_platform)/ctf/[ctfId=ctfId]/challenges`, {
                                ctfId: page.params.ctfId ?? '',
                            })
                        )}
                    Icon={Swords}
                    aria-label="Go to challenges" />
            </div>
        {/if}
    </div>
</main>
