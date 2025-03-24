<script lang="ts">
	let { data } = $props();
	let { translations } = data;
</script>

<div data-sveltekit-preload-data="tap flex flex-col justify-center w-screen h-screen">
	<div class="m-auto size-96 rounded border-2">
		<h1>{translations.login}</h1>
		<img src="/gh_light.svg" alt="GitHub Logo" class="hidden size-48 dark:block" />
		<img src="/gh_dark.svg" alt="GitHub Logo" class="block size-48 dark:hidden" />
		<a href="/login/github">{translations.loginwithgithub}</a>
	</div>
</div>
