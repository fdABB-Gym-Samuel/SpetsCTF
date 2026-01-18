<script lang="ts">
    import type { HTMLOlAttributes } from 'svelte/elements';
    import type { Result } from './dropdownTypes';

    interface Props extends HTMLOlAttributes {
        dropdownResults: Result[];
        onSelect: (result: Result) => void;
        currentSelected: number;
    }

    let {
        dropdownResults,
        onSelect,
        currentSelected = $bindable(),
        ...restProps
    }: Props = $props();
</script>

<ol
    {...restProps}
    class="bg-bg-800 border-primary-light absolute mt-18 max-h-50 w-full overflow-y-scroll rounded-md has-first:border-2">
    {#each dropdownResults as result (result.id)}
        <li
            class=""
            class:bg-bg-500={dropdownResults[currentSelected]?.id === result.id}>
            <button
                class="border-bg-500 w-full border-y-1 px-6 py-1.5 text-left"
                onmousedown={() => {
                    onSelect(result);
                }}>{result.primary} ({result.secondary})</button>
        </li>
    {/each}
</ol>
