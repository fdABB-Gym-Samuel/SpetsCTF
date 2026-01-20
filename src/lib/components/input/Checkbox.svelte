<script lang="ts">
    interface Props {
        title: string;
        options: { text: string; disabled: boolean; value: string }[];
        selected: string[];
        name: string;
    }

    let { title, options, selected = $bindable([]), name }: Props = $props();
</script>

<div>
    <fieldset>
        <legend>{title}</legend>
        <ul class="gap-x-4 pt-2">
            {#each options as option (option.text)}
                <li
                    class="flex w-full flex-row items-center gap-2 px-4 py-1 *:cursor-pointer">
                    <div>
                        <label
                            for={`${name}_${option.text}`}
                            class="text-text-100 cursor-pointer select-none">
                            {option.text}
                        </label>
                        {#if option.disabled}
                            <span class="text-point-500">*</span>
                        {/if}
                    </div>
                    <input
                        {name}
                        type="checkbox"
                        id={`${name}_${option.text}`}
                        bind:group={selected}
                        value={option.value}
                        class="bg-bg-600 checked:bg-primary size-4 appearance-none rounded-sm"
                        disabled={option.disabled} />
                </li>
            {/each}
        </ul>
    </fieldset>
</div>
