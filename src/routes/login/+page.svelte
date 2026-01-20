<script lang="ts">
    let { data } = $props();
    let translations = $derived(data.translations);

    import { goto } from '$app/navigation';
    import { resolve } from '$app/paths';
    import Button from '$lib/components/Button.svelte';

    import IconGithubLogoBold from 'phosphor-icons-svelte/IconGithubLogoBold.svelte';
</script>

<div data-sveltekit-preload-data="tap" class="mx-auto w-min pt-64">
    <div class="mb-8">
        <h1 class="mb-2 text-2xl">
            {translations.login} / Sign up
        </h1>
        <p class="text-text-200 min-w-max">You will be redirected to github.com</p>
    </div>
    <Button
        label="Continue with "
        type="button"
        onclick={() => goto(resolve('/login/github'))}
        aria-label="Continue with GitHub"
        Icon={IconGithubLogoBold}
        secondLabel="GitHub" />
</div>
