<script lang="ts">
    import { InfoIcon } from '@lucide/svelte';
    interface Props {
        text: string;
        size: number;
    }
    let { text, size }: Props = $props();

    let iconEl = $state<HTMLElement>();
    let tooltipEl = $state<HTMLElement>();
    let visible = $state(false);
    let pos = $state({ top: 0, left: 0 });

    function reposition() {
        if (!iconEl || !tooltipEl) return;
        const icon = iconEl.getBoundingClientRect();
        const tooltip = tooltipEl.getBoundingClientRect();
        const margin = 6;

        let top = icon.top - tooltip.height - margin;
        let left = icon.left + icon.width / 2 - tooltip.width / 2;

        if (top < 0) top = icon.bottom + margin;
        if (left < margin) left = margin;
        if (left + tooltip.width > window.innerWidth - margin) {
            left = window.innerWidth - tooltip.width - margin;
        }

        pos = { top, left };
    }

    function show() {
        visible = true;
        requestAnimationFrame(reposition);
    }

    function hide() {
        visible = false;
    }
</script>

<span
    bind:this={iconEl}
    role="tooltip"
    onmouseenter={show}
    onmouseleave={hide}
    class="inline-flex">
    <InfoIcon class="cursor-pointer" {size} />
</span>

{#if visible}
    <div
        bind:this={tooltipEl}
        style="position: fixed; top: {pos.top}px; left: {pos.left}px"
        class="pointer-events-none z-50 w-max max-w-xs rounded bg-black px-2 py-1 text-sm text-white">
        {text}
    </div>
{/if}
