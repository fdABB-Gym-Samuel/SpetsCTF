<script lang="ts">
    import { onMount } from 'svelte';
    import Dropdown from '$lib/components/input/Dropdown.svelte';
    let {
        label,
        type,
        placeholder,
        name,
        value = $bindable(),
        inputFocused = $bindable(false),
        width = 'w-full',
        dropdownData = null,
        pattern = undefined,
        multiple = false,
        required = false,
    } = $props();

    const handleKeyDown = (e: KeyboardEvent) => {
        if (dropdownData) {
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
    let currentSelected = $state(dropdownData?.currentSelected);
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
        {pattern}
        {name}
        autocomplete="off"
        id="input"
        {type}
        bind:value
        {placeholder}
        class="{width} bg-bg-850 border-bg-500 focus:border-primary-light rounded-full border-2 px-6 py-2 outline-0"
        onkeydown={(e) => handleKeyDown(e)}
        onfocus={() => (inputFocused = true)}
        onblur={() => (inputFocused = false)}
        {multiple}
        {required} />
    {#if dropdownData && inputFocused}
        <Dropdown {...dropdownData} bind:currentSelected></Dropdown>
    {/if}
</div>
