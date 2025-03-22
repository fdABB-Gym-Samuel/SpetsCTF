<script lang="ts">
	// export let user_name:string | undefined = undefined;

	import { goto } from '$app/navigation';
	import type { Users } from '$lib/db/db';
	import type { Selectable } from 'kysely';

	interface Props {
		user: Selectable<Users> | undefined;
		translations: Record<string, string>;
	}

	let show_sidebar = $state(false)

	let { user, translations }: Props = $props();

	const toggle_sidebar = () => {
		show_sidebar = !show_sidebar
	}
</script>

<nav
	class="bg-background-dark text-foreground-dark fixed z-15 top-0 flex h-[var(--nav-height)] w-full flex-row items-center justify-between px-4 outline-1 outline-[var(--color-accent-dark)]"
>
	<div class="left flex flex-row items-center">
		<div class="logo-continer mr-4">
			<a class="nav-option underline" href="/">
				<img src="/logo.svg" alt="" class="logo h-10" />
			</a>
		</div>
		<ul class="hidden sm:flex h-full flex-row items-center justify-evenly space-x-2 ">
			<!-- <li class="mr-4">
				<a class="nav-option underline" href="/"><img src="/logo.svg" alt="" class="logo h-10" /></a
				>
			</li> -->
			<li class="mr-4">
				<a class="nav-option underline" href="/challenges">{translations.challenges}</a>
			</li>
			<!-- <li class="mr-4"><a class="underline nav-option" href="/writeups">Writeups</a></li> -->
			<li class="mr-4">
				<a class="nav-option underline" href="/scoreboard">{translations.leaderboard}</a>
			</li>
			<li class="mr-4"><a class="nav-option underline" href="/about">{translations.about}</a></li>
		</ul>
		<div class="mr-4 sm:hidden block">
			<button 
				class="ignore-default flex flex-col gap-1.5" 
				aria-label="Open Sidebar"
				onclick={toggle_sidebar}>
				<span class="bg-button-dark w-6 h-1"></span>
				<span class="bg-button-dark w-6 h-1"></span>
				<span class="bg-button-dark w-6 h-1"></span>
			</button>
		</div>
		<span class="separator hidden sm:block bg-accent-dark h-8 w-0.5"></span>
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

{#if show_sidebar}
<div 
	class="backdrop bg-backdrop absolute w-screen h-[var(--main-height)] bottom-0 sm:hidden"
	onclick={toggle_sidebar}
	onkeydown={(e) => {if (e.key === " " || e.key === "Enter") toggle_sidebar()}}
	aria-label="close-sidebar"
	role="button"
	tabindex="0">
	<nav class="h-full flex flex-row bottom-0 w-120 max-w-9/10 bg-background-dark z-10 border-r-accent-dark border-2 pt-2">
		<div class="pl-2">
			<button aria-label="Close sidebar" class="ignore-default">
				<svg
					  xmlns="http://www.w3.org/2000/svg"
					  viewBox="0 0 24 24"
					  width="24"
					  height="24"
					  fill="none"
					  stroke="currentColor"
					  stroke-width="2"
					  stroke-linecap="round"
					  stroke-linejoin="round"
					  class="back-arrow w-10 h-10 text-foreground-dark"
					>
					  <line x1="22" y1="12" x2="5" y2="12" />
					  <polyline points="12 19 5 12 12 5" />
					</svg>

			</button>
		</div>
		<div class="w-full pt-4">
			<ul class="flex h-full flex-col items-stretch text-foreground-dark pr-5 pl-2 text-xl space-x-2 ">
				<li class="border-stone-400 border-b-2 py-2 pl-1 m-0">
					<a class="nav-option" href="/challenges">Challenges</a>
				</li>
				<li class="border-stone-400 border-b-2 py-2 pl-1 m-0">
					<a href="/scoreboard">Leaderboard</a>
				</li>
				<li class="border-stone-400 border-b-2 py-2 pl-1 m-0">
					<a href="/about">About</a>
				</li>
			</ul>
		</div>
	</nav>
</div>
{/if}
