<script lang="ts">
    import type { HTMLSelectAttributes } from 'svelte/elements';

    interface Props extends HTMLSelectAttributes {
        label: string;
        options: { value: string; text: string }[];
    }

    let {
        label,
        name,
        options,
        value = $bindable(),
        required,
        ...restProps
    }: Props = $props();
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
        {...restProps}
        class="bg-bg-700 border-bg-500 focus:border-primary-light w-full rounded-full border-2 px-6 py-2"
        bind:value>
        {#each options as option (option.value)}
            <option value={option.value}>{option.text}</option>
        {/each}
    </select>
</div>
