<script lang="ts">
	import { goto } from '$app/navigation';
	import type { Users } from '$lib/db/db';
	import type { Selectable } from 'kysely';

	interface Props {
		user: Selectable<Users> | undefined;
	}

	let { user }: Props = $props();
	console.log(user);
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
			<li class="mr-4"><a class="nav-option underline" href="/challenges">Challenges</a></li>
			<!-- <li class="mr-4"><a class="underline nav-option" href="/writeups">Writeups</a></li> -->
			<li class="mr-4"><a class="nav-option underline" href="/scoreboard">Scoreboard</a></li>
			<li class="mr-4"><a class="nav-option underline" href="/about">About</a></li>
		</ul>
		<span class="separator bg-accent-dark h-8 w-0.5"></span>
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
