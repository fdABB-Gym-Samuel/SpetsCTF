<script lang="ts">
	let { data } = $props();
	let { translations } = data;
</script>

<div data-sveltekit-preload-data="tap" class="flex h-screen flex-col justify-center">
	<div class="m-auto flex size-96 flex-col justify-evenly rounded border-2">
		<h1 class="mx-auto text-2xl font-bold">{translations.login}</h1>
		<img src="/gh_light.svg" alt="GitHub Logo" class="mx-auto hidden size-32 dark:block" />
		<img src="/gh_dark.svg" alt="GitHub Logo" class="mx-auto block size-32 dark:hidden" />
		<a
			href="/login/github"
			class="mx-auto w-fit rounded border-2 border-black p-2 dark:border-white"
			>{translations.loginwithgithub}</a
		>
	</div>
</div>
