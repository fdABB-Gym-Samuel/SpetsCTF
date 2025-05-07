<script lang="ts">
	import { goto } from '$app/navigation';
	import type { Users } from '$lib/db/db';
	import type { Selectable } from 'kysely';

	import { page } from '$app/state';

	import { gsap } from 'gsap';

	import Button from './Button.svelte';

	import { ArrowLeft, User, LogIn } from '@lucide/svelte';

	interface NavLink {
		display: string;
		href: string;
	}

	interface Props {
		user: Selectable<Users> | undefined;
		translations: Record<string, string>;
		links: NavLink[];
	}

	let showSidebar = $state(false);

	let { user, translations, links }: Props = $props();

	const toggle_sidebar = (e: MouseEvent | KeyboardEvent, isBackdrop: boolean = false) => {
		if (isBackdrop) {
			if (e.currentTarget === e.target) {
				showSidebar = !showSidebar;
			}
		} else {
			showSidebar = !showSidebar;
		}
	};
</script>

<header class="z-40">
	<nav
		class="bg-bg-900 fixed top-0 left-0 z-40 flex h-15 w-full flex-row items-center justify-between gap-5 px-4 *:w-1/3 sm:px-6 md:px-10"
	>
		<div class="left flex w-1/5 flex-grow-0 flex-row items-center sm:flex-grow">
			<div class="logo-continer relative mr-4 flex justify-end sm:mr-0">
				<svg
					viewBox="0 0 180 100"
					preserveAspectRatio="xMidYMin slice"
					class="pointer-events-none absolute top-0 left-0 -z-5 select-none"
				>
					<filter width="200%" height="200%" x="-50%" y="-50%" id="turbulance">
						<feTurbulence
							id="turbulance"
							type="fractalNoise"
							baseFrequency="0"
							numOctaves="1"
							result="turbulance"
							seed="5"
						>
						</feTurbulence>
						<feDisplacementMap
							in="SourceGraphic"
							in2="turbulence"
							scale="30"
							xChannelSelector="R"
							yChannelSelector="R"
						></feDisplacementMap>
					</filter>
					<foreignObject width="100%" height="100%" overflow="visible"></foreignObject>
				</svg>
				<a
					class="nav-option link"
					style="filter: url(#turbulance);"
					href="/"
					aria-label="Home"
					onmouseenter={() =>
						gsap.to('#turbulance', { attr: { baseFrequency: 0.01 }, duration: 1.2 })}
					onmouseleave={() => gsap.to('#turbulance', { attr: { baseFrequency: 0 }, duration: 1.2 })}
				>
					<img src="/assets/logo.svg" alt="SpetsCTF" class="logo h-5 min-w-25 select-none" />
				</a>
			</div>
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
		</div>
		<ul class="hidden h-full min-w-fit flex-row items-center justify-center gap-8 sm:flex">
			{#each links as nav_link}
				<li>
					<a
						class="nav-option link {page.url.pathname === nav_link.href
							? 'decoration-bg-700 underline decoration-3 underline-offset-4'
							: ''}"
						href={nav_link.href}>{nav_link.display}</a
					>
				</li>
			{/each}
		</ul>
		<div class="flex w-1/5 flex-grow justify-end overflow-y-hidden">
			{#if user}
				<a href="/user" class="ignore-default max-w-full space-x-4 truncate text-center underline">
					<User class=" inline-block min-h-6 min-w-6" />
					{user.display_name || user.github_username}</a
				>
			{:else}
				<Button
					label={translations.login}
					type="button"
					onClick={() => goto('/login')}
					Icon={LogIn}
					ariaLabel="Login"
				/>
				<!-- <button
          onclick={() => goto('/login')}
          class="login-btn bg-button-light dark:bg-button-dark rounded-[var(--button-radius)] px-6 py-2 font-semibold"
          >{translations.login}</button
        > -->
			{/if}
		</div>
	</nav>
	{#if showSidebar}
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
</header>
