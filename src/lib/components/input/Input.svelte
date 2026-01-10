<script lang="ts">
    import { onMount } from 'svelte';
    import Dropdown from '$lib/components/input/Dropdown.svelte';
    import type { HTMLInputAttributes } from 'svelte/elements';

    interface Props extends HTMLInputAttributes {
        label: string;
        inputFocused?: boolean;
        widthClass?: string;
        dropdownData?: any;
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
        dropdownData = null,
        ...restProps
    }: Props = $props();

    const handleKeyDown = (e: KeyboardEvent) => {
        if (dropdownData && currentSelected !== undefined) {
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                currentSelected =
                    (currentSelected - 1 + dropdownData.results.length) %
                    dropdownData.results.length;
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                currentSelected = (currentSelected + 1) % dropdownData.results.length;
            } else if (e.key === 'Enter' && inputFocused) {
                dropdownData.onSelect(dropdownData.results[currentSelected]);
            }
        }
    };
    let currentSelected: number | undefined = $state();
    let inputElement: HTMLInputElement | undefined;

    onMount(() => {
        inputFocused = inputElement === document.activeElement;
        if (dropdownData) currentSelected = dropdownData;
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
        autocomplete="off"
        id="input"
        bind:value
        class="{widthClass} bg-bg-850 border-bg-500 focus:border-primary-light rounded-full border-2 px-6 py-2 outline-0"
        onkeydown={(e) => handleKeyDown(e)}
        onfocus={() => (inputFocused = true)}
        onblur={() => (inputFocused = false)}
        {...restProps}
        {required} />
    {#if dropdownData && inputFocused}
        <Dropdown {...dropdownData} bind:currentSelected></Dropdown>
    {/if}
</div>
