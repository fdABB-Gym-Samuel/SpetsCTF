<script lang="ts">
    let { data, form } = $props();
    let editableChallenge = $derived(data.editableChallenge);
    let translations = $derived(data.translations);
</script>

<div class="content mb-4">
    <h2 class="text-4xl font-bold">Edit Challenge</h2>
    {#if form && form?.success}
        <span class="text-green-600">{translations.success}: {form.message}</span>
    {:else if form && !form?.success}
        <span class="text-red-600">{translations.failure}: {form.message}</span>
    {/if}
</div>
