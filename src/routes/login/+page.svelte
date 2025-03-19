<script lang="ts">
	let { data } = $props();
	let { translations } = data;
</script>

<div data-sveltekit-preload-data="tap" class="flex flex-col justify-center h-screen">
	<div class="m-auto size-96 border-2 rounded flex flex-col justify-evenly">
		<h1 class="text-2xl font-bold mx-auto">{translations.login}</h1>
		<img src='/gh_light.svg' alt='GitHub Logo' class="size-32 mx-auto hidden dark:block" />
		<img src='/gh_dark.svg' alt='GitHub Logo' class="size-32 mx-auto block dark:hidden" />
		<a href="/login/github" class="dark:border-white border-black border-2 rounded w-fit p-2 mx-auto">{translations.loginwithgithub}</a>
	</div>
</div>
