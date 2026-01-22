<script lang="ts">
    import IconCheckBold from 'phosphor-icons-svelte/IconCheckBold.svelte';
    interface Props {
        title: string;
        options: { text: string; disabled: boolean; value: string }[];
        selected: string[];
        name: string;
        alignCheckboxes?: boolean;
    }
    let {
        title,
        options,
        selected = $bindable([]),
        name,
        alignCheckboxes,
    }: Props = $props();
</script>

<div>
    <fieldset>
        <legend>{title}</legend>
        <ul class="pt-2">
            {#each options as option (option.text)}
                <li
                    class="flex w-full flex-row items-center gap-3 px-4 py-1 {alignCheckboxes
                        ? 'w-48! justify-between'
                        : ''}">
                    <div class="pb-1">
                        <label
                            for={`${name}_${option.text}`}
                            class="text-text-100 cursor-pointer select-none">
                            {option.text}
                        </label>
                        {#if option.disabled}
                            <span class="text-point-500">*</span>
                        {/if}
                    </div>
                    <div class="relative cursor-pointer">
                        <input
                            {name}
                            type="checkbox"
                            id={`${name}_${option.text}`}
                            bind:group={selected}
                            value={option.value}
                            class="border-bg-600 checked:border-primary-light checked:bg-primary peer size-6 cursor-pointer appearance-none rounded-sm border-2 transition-colors duration-100"
                            disabled={option.disabled} />
                        <div
                            class="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pb-1 opacity-0 transition-opacity peer-checked:opacity-100">
                            <IconCheckBold class="text-[16px]" />
                        </div>
                    </div>
                </li>
            {/each}
        </ul>
    </fieldset>
</div>
