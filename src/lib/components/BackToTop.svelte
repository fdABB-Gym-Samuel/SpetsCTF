<script lang="ts">
  import { ArrowUp } from '@lucide/svelte';
</script>

<footer class="flex justify-center items-center w-full my-64">
  <button class="cursor-pointer" type="button" onclick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
    <p class="inline-block font-bold">Back to top</p>
    <ArrowUp class="inline-block mb-0.5" />
  </button>
</footer>
