<script lang="ts">
    import { ArrowUp } from '@lucide/svelte';
</script>

<footer class="my-64 flex w-full items-center justify-center">
    <button
        class="cursor-pointer"
        type="button"
        onclick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <p class="inline-block font-bold">Back to top</p>
        <ArrowUp class="mb-0.5 inline-block" />
    </button>
</footer>
