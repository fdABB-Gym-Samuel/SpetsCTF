<script lang="ts">
	let { data } = $props();
	let { translations } = data;

	import { goto } from '$app/navigation';
	import Button from '$lib/components/Button.svelte';
	import { Github } from '@lucide/svelte';

	import { playAnimations } from '$lib/gsap/animations.js';
	import { onDestroy, onMount } from 'svelte';

	let componentRoot: HTMLElement;
	let gsapContext: gsap.Context | undefined;

	onMount(() => {
		gsapContext = playAnimations(componentRoot);
	});

	onDestroy(() => {
		gsapContext?.revert();
	});
</script>

<div
	data-sveltekit-preload-data="tap"
	class="m-auto flex max-w-128 flex-col justify-center pt-48"
	bind:this={componentRoot}
>
	<h1 class="gsap-top-down-opacity mb-4 text-center text-xl font-bold">{translations.login}</h1>
	<Button
		label="Log in with "
		type="button"
		onClick={() => goto('/login/github')}
		ariaLabel="Login with GitHub"
		Icon={Github}
		secondLabel="GitHub"
		twStyles="gsap-top-down-opacity"
	/>
	<!-- <a
    href="/login/github"
    class="mx-auto w-fit rounded border-2 border-black p-2 dark:border-white"
    >{translations.loginwithgithub}</a
  > -->
</div>
