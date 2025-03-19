<script lang="ts">
	// export let user_name:string | undefined = undefined;

	interface Props {
		user_name?: string | undefined;
		translations: Record<string, string>;
	}
	let { user_name = undefined, translations }: Props = $props();
</script>

<nav
	class="bg-background-dark text-foreground-dark fixed top-0 flex h-[var(--nav-height)] w-full flex-row items-center justify-between px-4 outline-1 outline-[var(--color-accent-dark)]"
>
	<div class="left flex flex-row items-center">
		<ul class="flex h-full flex-row items-center justify-evenly space-x-2">
			<li class="mr-4">
				<a class="nav-option underline" href="/"><img src="/logo.svg" alt="" class="logo h-10" /></a
				>
			</li>
			<li class="mr-4">
				<a class="nav-option underline" href="/challenges">{translations.challenges}</a>
			</li>
			<!-- <li class="mr-4"><a class="underline nav-option" href="/writeups">Writeups</a></li> -->
			<li class="mr-4">
				<a class="nav-option underline" href="/scoreboard">{translations.leaderboard}</a>
			</li>
			<li class="mr-4"><a class="nav-option underline" href="/about">{translations.about}</a></li>
		</ul>
		<span class="separator bg-accent-dark h-8 w-0.5"></span>
	</div>
	<div class="right">
		{#if user_name}
			<p>{user_name}</p>
		{:else}
			<a
				href="/login"
				class="login-btn bg-button-dark rounded-[var(--button-radius)] px-6 py-2 font-semibold"
				>{translations.log_in}</a
			>
		{/if}
	</div>
</nav>
