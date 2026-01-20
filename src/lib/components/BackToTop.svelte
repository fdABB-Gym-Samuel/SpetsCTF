<script lang="ts">
    import IconArrowElbowRightUpBold from 'phosphor-icons-svelte/IconArrowElbowRightUpBold.svelte';
</script>

<button
    class="text-text-150 flex cursor-pointer items-center gap-2.5"
    type="button"
    onclick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
    <p class="inline-block font-semibold">Back to top</p>
    <IconArrowElbowRightUpBold class="text-[22px]" />
</button>
