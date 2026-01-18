<script lang="ts">
    import { resolve } from '$app/paths';
    import { Spring } from 'svelte/motion';

    let { data } = $props();
    let nextCtf = $derived(data.nextCtf);

    import IconArrowRightBold from 'phosphor-icons-svelte/IconArrowRightBold.svelte';
    import IconGraduationCapBold from 'phosphor-icons-svelte/IconGraduationCapBold.svelte';

    import { onMount, onDestroy } from 'svelte';
    import { goto } from '$app/navigation';

    import HSeperator from '$lib/components/HSeperator.svelte';
    import Button from '$lib/components/Button.svelte';

    let countdown = $state({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    type Timeout = ReturnType<typeof setInterval>;
    let interval: Timeout;

    function updateCountdown(): void {
        if (nextCtf === undefined) {
            countdown = { days: 0, hours: 0, minutes: 0, seconds: 0 };
            return;
        }
        const now = new Date();
        const diff = nextCtf?.start_time.getTime() - now.getTime();

        if (diff <= 0) {
            countdown = { days: 0, hours: 0, minutes: 0, seconds: 0 };
            clearInterval(interval);
            return;
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
        rotY.set(xNorm * maxRotate);
        rotX.set(-yNorm * maxRotate);
    }

    function handleMouseLeave() {
        // Reset back to flat
        rotX.set(0);
        rotY.set(0);
    }

    onMount(() => {
        updateCountdown();
        interval = setInterval(updateCountdown, 1000);
    });

    onDestroy(() => {
        clearInterval(interval);
    });
</script>

<svelte:body onmousemove={handleMouseMove} onmouseleave={handleMouseLeave} />

<main class="m-auto max-w-130 pt-48">
    <div class="mb-16">
        <p class="mb-6">
            A place to practice and compete in cybersecurity challenges.<br /><span
                class="text-text-150">Either log in or stay anonymous.</span>
        </p>
        <div class="flex gap-4">
            <Button
                label="Start practicing"
                type="button"
                onclick={() => goto(resolve('/challenges'))}
                Icon={IconArrowRightBold}
                aria-label="Go to challenges" />
            <Button
                label="Learn"
                type="button"
                onclick={() => {}}
                Icon={IconGraduationCapBold}
                aria-label="Go to learn page" />
        </div>
    </div>
    <div class="w-full perspective-midrange">
        <article
            bind:this={countdownContainer}
            class="w-full will-change-transform transform-3d"
            style="transform: rotateX({rotX.current}deg) rotateY({rotY.current}deg)">
            <p class="text-text-200 mb-2 text-sm">Next SpetsCTF is in</p>
            <div class="rounded-lg shadow-xl">
                <div
                    class="bg-bg-800 inner-shadow flex items-center justify-between rounded-2xl px-10 py-2 pb-3 select-none">
                    {#each Object.entries(countdown) as [label, number], index (label)}
                        <div class="flex flex-col items-center">
                            <p class="-mb-1 flex-1 text-center text-lg">
                                {number}
                            </p>
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
        </article>
    </div>
</main>
