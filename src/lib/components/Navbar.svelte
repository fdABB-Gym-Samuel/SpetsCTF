<script lang="ts">
	import { goto } from '$app/navigation';
	import type { Users } from '$lib/db/db';
	import type { Selectable } from 'kysely';

	import { ArrowLeft, User } from '@lucide/svelte';

	interface NavLink {
		display: string;
		href: string;
	}

	interface Props {
		user: Selectable<Users> | undefined;
		translations: Record<string, string>;
		links: NavLink[];
	}

	let show_sidebar = $state(false);

	let { user, translations, links }: Props = $props();

	const toggle_sidebar = (e: MouseEvent | KeyboardEvent, is_backdrop: boolean = false) => {
		if (is_backdrop) {
			if (e.currentTarget === e.target) {
				show_sidebar = !show_sidebar;
			}
		} else {
			show_sidebar = !show_sidebar;
		}
	};
</script>

<nav
	class="bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark outline-accent-light fixed top-0 z-15 flex h-[var(--nav-height)] w-full flex-row items-center justify-between px-4 outline-2 dark:outline-[var(--color-accent-dark)]"
>
	<div class="left flex flex-row items-center">
		<div class="logo-continer mr-4">
			<a class="nav-option underline" href="/" aria-label="Home">
				<img src="/logo.svg" alt="" class="logo h-10 w-10 max-w-10" />
			</a>
		</div>
		<ul class="hidden h-full flex-row items-center justify-evenly space-x-2 sm:flex">
			{#each links as nav_link}
				<li class="mr-4">
					<a class="nav-option underline" href={nav_link.href}>{nav_link.display}</a>
				</li>
			{/each}
		</ul>
		<div class="mr-4 block sm:hidden">
			<button
				class="ignore-default flex flex-col gap-1.5"
				aria-label="Open Sidebar"
				onclick={toggle_sidebar}
			>
				<span class="bg-foreground-light dark:bg-foreground-dark h-1 w-6 rounded-sm"></span>
				<span class="bg-foreground-light dark:bg-foreground-dark h-1 w-6 rounded-sm"></span>
				<span class="bg-foreground-light dark:bg-foreground-dark h-1 w-6 rounded-sm"></span>
			</button>
		</div>
		<span class="separator bg-accent-dark hidden h-8 w-0.5 sm:block"></span>
	</div>
	<div class="right">
		{#if user}
			<a href="/user" class="ignore-default flex flex-row items-center space-x-4 underline">
				<User />
				{user.display_name || user.github_username}</a
			>
		{:else}
			<button
				onclick={() => goto('/login')}
				class="login-btn bg-button-light dark:bg-button-dark rounded-[var(--button-radius)] px-6 py-2 font-semibold"
				>{translations.login}</button
			>
		{/if}
	</div>
</nav>

{#if show_sidebar}
	<div
		class="backdrop bg-backdrop-light dark:bg-backdrop-dark fixed bottom-0 left-0 h-[var(--main-height)] w-screen"
		onclick={(e: MouseEvent) => toggle_sidebar(e, true)}
		onkeydown={(e) => {
			if (e.key === ' ' || e.key === 'Enter') toggle_sidebar(e, true);
		}}
		aria-label="close-sidebar"
		role="button"
		tabindex="0"
	>
		<nav
			class="bg-background-light dark:bg-background-dark border-r-accent-light dark:border-r-accent-dark bottom-0 z-10 flex h-full w-120 max-w-9/10 flex-row border-2 pt-2"
		>
			<div class="pl-2">
				<button aria-label="Close sidebar" class="ignore-default" onclick={toggle_sidebar}>
					<ArrowLeft />
				</button>
			</div>
			<div class="w-full pt-4">
				<ul
					class="text-foreground-light dark:text-foreground-dark flex h-full flex-col items-stretch space-x-2 pr-5 pl-2 text-xl"
				>
					{#each links as link}
						<li class="m-0 border-b-2 border-stone-400 py-2 pl-1">
							<a class="ignore-default" href={link.href}>{link.display}</a>
						</li>
					{/each}
				</ul>
			</div>
		</nav>
	</div>
{/if}
