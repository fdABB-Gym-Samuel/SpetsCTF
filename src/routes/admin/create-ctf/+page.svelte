<script lang="ts">
    import Input from '$lib/components/input/Input.svelte';
    import Button from '$lib/components/Button.svelte';
    import { enhance } from '$app/forms';
    import { formatRequestedName } from '$lib/utils/utils';

    let { data } = $props();
    let translations = $derived(data.translations);

    let requestedDisplayName = $state('');
    let derivedShortName = $derived(formatRequestedName(requestedDisplayName));
    let start_time: Date | undefined = $state(undefined);
    let end_time: Date | undefined = $state(undefined);

    let formValid: boolean = $derived.by(() => {
        if (!!start_time && !!end_time) {
            if (start_time <= end_time) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    });
</script>

<div class="content w-screen">
    <h1>{translations.createctf}</h1>
    <form method="post" class="mx-auto flex w-1/2 flex-col space-y-2" use:enhance>
        <div>
            <Input
                type="text"
                label={translations.ctf_display_name_label}
                placeholder={translations.displaynamectf}
                name="display_name"
                bind:value={requestedDisplayName}
                id="display_name" />
        </div>
        <div>
            <span class="font-mono">{derivedShortName}</span>
        </div>
        <div>
            <Input
                type="number"
                label={translations.ctf_max_team_size_label}
                value={null}
                placeholder="3"
                name="max_team_size"
                id="max_team_size" />
        </div>
        <div class="flex flex-col">
            <Input
                label={translations.ctf_start_time_label}
                bind:value={start_time}
                type="datetime-local"
                name="start_time"
                id="start_time" />
        </div>
        <div class="flex flex-col">
            <Input
                label={translations.ctf_end_time_label}
                bind:value={end_time}
                type="datetime-local"
                name="end_time"
                id="end_time" />
        </div>
        <Button type="submit" disabled={!formValid} label="Submit"></Button>
    </form>
</div>
