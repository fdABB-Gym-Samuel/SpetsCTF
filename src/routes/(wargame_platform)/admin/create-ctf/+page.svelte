<script lang="ts">
    import { enhance } from '$app/forms';

    let { data } = $props();
    let translations = $derived(data.translations);

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
            <label for="display_name">{translations.ctf_display_name_label}</label>
            <input
                type="text"
                class="w-full border p-1"
                placeholder={translations.displaynamectf}
                name="display_name"
                id="display_name" />
        </div>
        <div>
            <label for="short_name">{translations.ctf_short_name_label}</label>
            <input
                type="text"
                class="w-full border p-1"
                placeholder={translations.shortnamectf}
                name="short_name"
                id="short_name" />
        </div>
        <div>
            <label for="max_team_size">{translations.ctf_max_team_size_label}</label>
            <input
                type="number"
                class="w-full border p-1"
                value={null}
                placeholder="3"
                name="max_team_size"
                id="max_team_size" />
        </div>
        <div class="flex flex-col">
            <label for="start_time">{translations.ctf_start_time_label}</label>
            <input
                bind:value={start_time}
                type="datetime-local"
                class="border p-1"
                name="start_time"
                id="start_time" />
        </div>
        <div class="flex flex-col">
            <label for="end_time">{translations.ctf_end_time_label}</label>
            <input
                bind:value={end_time}
                type="datetime-local"
                class="border p-1"
                name="end_time"
                id="end_time" />
        </div>
        <button type="submit" disabled={!formValid}>{translations.submit}</button>
    </form>
</div>
