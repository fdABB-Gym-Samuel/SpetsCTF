<script lang="ts">
    let { label, name, id, options, value = $bindable(), required = false } = $props();
</script>

<div class="flex w-6/10 flex-col">
    <label for={name}>
        <span>{label}</span>

        {#if required}
            <span class="text-primary-light">*</span>
        {/if}
    </label>

    <select
        {name}
        {id}
        class="bg-bg-700 border-bg-500 focus:border-primary-light w-full rounded-full border-2 px-6 py-2"
        bind:value
        {required}>
        {#each options as option (option.value)}
            <option value={option.value}>{option.text}</option>
        {/each}
    </select>
</div>
