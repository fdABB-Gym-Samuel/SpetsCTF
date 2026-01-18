<script lang="ts">
    let { data } = $props();
    let translations = $derived(data.translations);

    import { goto } from '$app/navigation';
    import { resolve } from '$app/paths';
    import Button from '$lib/components/Button.svelte';
    import { Github } from '@lucide/svelte';
</script>

<div
    data-sveltekit-preload-data="tap"
    class="m-auto flex max-w-128 flex-col justify-center pt-48">
    <h1 class="mb-4 text-center text-xl font-bold">
        {translations.login}
    </h1>
    <Button
        label="Log in with "
        type="button"
        onclick={() => goto(resolve('/login/github'))}
        aria-label="Login with GitHub"
        Icon={Github}
        secondLabel="GitHub" />
</div>
