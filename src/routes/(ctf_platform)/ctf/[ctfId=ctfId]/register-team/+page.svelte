<script lang="ts">
    import { enhance } from '$app/forms';
    let { data, form } = $props();
    let translations = $derived(data.translations);

    import Input from '$lib/components/input/Input.svelte';
    import Button from '$lib/components/Button.svelte';

    import IconPlusBold from 'phosphor-icons-svelte/IconPlusBold.svelte';
</script>

<div class="content mx-auto w-[90%] pt-32 sm:w-lg">
    <h1 class="mb-8 text-[22px] font-semibold">{translations.register_team}</h1>
    {#if form}
        <div class="mb-8">
            <span class="text-red-600">{translations.failure}: {form.message}</span>
        </div>
    {/if}
    <form method="post" use:enhance>
        <div class="mb-16 flex w-full flex-col gap-6">
            <Input
                label={translations.team_name}
                placeholder="Team name"
                name="team_name"
                type="text"
                required></Input>
            <Input
                label={translations.team_website}
                type="url"
                name="team_website"
                placeholder="https://github.com/fdABB-Gym-Samuel/SpetsCTF" />
        </div>
        <Button type="submit" label="Create team" inverted={true} Icon={IconPlusBold}
        ></Button>
    </form>
</div>
