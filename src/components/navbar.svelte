<script lang="ts">
	// export let user_name:string | undefined = undefined;

	import { goto } from '$app/navigation';
	import type { Users } from '$lib/db/db';
	import type { Selectable } from 'kysely';

	interface Props {
		user: Selectable<Users> | undefined;
		translations: Record<string, string>;
	}

	let { user, translations }: Props = $props();
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
			<li class="mr-4"><a class="nav-option underline" href="/ctf">{translations.ctf}</a></li>
			<li class="mr-4">
				<a class="nav-option underline" href="/scoreboard">{translations.leaderboard}</a>
			</li>
			<li class="mr-4"><a class="nav-option underline" href="/about">{translations.about}</a></li>
		</ul>
	</div>
	<div class="right">
		{#if user}
			<a href="/user" class="flex flex-row items-center space-x-4 underline">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="lucide lucide-user"
					><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle
						cx="12"
						cy="7"
						r="4"
					/></svg
				>
				{user.display_name || user.github_username}</a
			>
		{:else}
			<button
				onclick={() => goto('/login')}
				class="login-btn bg-button-dark rounded-[var(--button-radius)] px-6 py-2 font-semibold"
				>Log In</button
			>
		{/if}
	</div>
</nav>
