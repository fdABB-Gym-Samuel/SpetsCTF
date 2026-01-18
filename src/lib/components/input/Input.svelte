<script lang="ts">
    import { onMount } from 'svelte';
    import type { HTMLInputAttributes } from 'svelte/elements';

    interface Props extends HTMLInputAttributes {
        label: string;
        inputFocused?: boolean;
        widthClass?: string;
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
        ...restProps
    }: Props = $props();

    let inputElement: HTMLInputElement | undefined;

    onMount(() => {
        inputFocused = inputElement === document.activeElement;
    });
</script>

<div class="relative flex flex-col">
    <div>
        <label for={name}>
            <span>{label}</span>

            {#if required}
                <span class="text-primary-light">*</span>
            {/if}
        </label>
    </div>
    <input
        bind:this={inputElement}
        {name}
        {type}
        {placeholder}
        autocomplete="off"
        id="input"
        bind:value
        class="{widthClass} bg-bg-850 border-bg-500 focus:border-primary-light rounded-full border-2 px-6 py-2 outline-0"
        onfocus={() => (inputFocused = true)}
        onblur={() => (inputFocused = false)}
        {...restProps}
        {required} />
</div>
