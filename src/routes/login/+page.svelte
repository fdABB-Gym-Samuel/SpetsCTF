<script lang="ts">
	let { data } = $props();
	let { translations } = data;
</script>

<div data-sveltekit-preload-data="tap flex flex-col justify-center w-screen h-screen">
	<div class="m-auto size-96 border-2 rounded">
		<h1>{translations.login}</h1>
		<img src='/gh_light.svg' alt='GitHub Logo' class="size-48 hidden dark:block" />
		<img src='/gh_dark.svg' alt='GitHub Logo' class="size-48 block dark:hidden" />
		<a href="/login/github">{translations.loginwithgithub}</a>
	</div>
</div>
