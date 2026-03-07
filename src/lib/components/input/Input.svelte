<script lang="ts">
    import { onMount } from 'svelte';
    import type { HTMLInputAttributes } from 'svelte/elements';
    import Information from '../Information.svelte';

    interface Props extends HTMLInputAttributes {
        label: string;
        inputFocused?: boolean;
        widthClass?: string;
        info?: string;
    }

    let {
        label,
        type,
        placeholder,
        name,
        required,
        value = $bindable(),
        inputFocused = $bindable(false),
        widthClass = 'w-full',
        info,
        ...restProps
    }: Props = $props();

    let inputElement: HTMLInputElement | undefined;

    onMount(() => {
        inputFocused = inputElement === document.activeElement;
    });
</script>

<div class="relative flex flex-col">
    <div class="mb-3 flex justify-between">
        <label for={name}>
            <span>{label}</span>

            {#if required}
                <span class="text-primary-light">*</span>
            {/if}
        </label>
        {#if info}
            <Information size={16} text={info}></Information>
        {/if}
    </div>
    <input
        bind:this={inputElement}
        {name}
        {type}
        {placeholder}
        autocomplete="off"
        id="input"
        bind:value
        class="{widthClass} bg-bg-800 focus:bg-bg-700 rounded-lg px-6 py-2.5 outline-0 transition-colors"
        onfocus={() => (inputFocused = true)}
        onblur={() => (inputFocused = false)}
        {...restProps}
        {required} />
</div>
