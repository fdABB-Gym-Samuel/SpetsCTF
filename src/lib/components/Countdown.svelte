<script lang="ts">
    import { Spring } from 'svelte/motion';
    import { onMount, onDestroy } from 'svelte';
    import HSeperator from '$lib/components/HSeperator.svelte';

    type CountdownTime = {
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
    };

    let {
        targetDate,
        translations,
    }: { targetDate: Date | undefined; translations: Record<string, string> } =
        $props();

    let countdown = $state<CountdownTime>({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });
    let countdownContainer: HTMLElement;

    type Timeout = ReturnType<typeof setInterval>;
    let interval: Timeout;

    const maxRotate: number = 1;
    const rotX = new Spring(0, { stiffness: 0.15, damping: 0.8 });
    const rotY = new Spring(0, { stiffness: 0.15, damping: 0.8 });

    function updateCountdown(): void {
        if (targetDate === undefined) {
            countdown = { days: 0, hours: 0, minutes: 0, seconds: 0 };
            return;
        }

        const now = new Date();
        const diff = targetDate.getTime() - now.getTime();

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

<article
    bind:this={countdownContainer}
    class="w-full will-change-transform transform-3d"
    style="transform: rotateX({rotX.current}deg) rotateY({rotY.current}deg)">
    <p class="text-text-200 mb-2 text-sm">{translations.next_spetsctf_is_in}</p>
    <div class="rounded-lg shadow-xl">
        <div
            class="bg-bg-800 inner-shadow flex items-center justify-between rounded-2xl px-10 py-2 pb-3 select-none">
            {#each Object.entries(countdown) as [label, number], index (label)}
                <div class="flex flex-col items-center">
                    <p class="-mb-1 flex-1 text-center text-lg">
                        {number}
                    </p>
                    <p class="text-text-200 text-sm">{translations[label]}</p>
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
