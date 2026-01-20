<script lang="ts">
    import { goto } from '$app/navigation';
    import type { Users } from '$lib/generated/db';
    import type { Selectable } from 'kysely';
    import { Menu } from '@lucide/svelte';

    import { page } from '$app/state';
    import { asset, resolve } from '$app/paths';
    import type { ResolvedPathname } from '$app/types';

    import Button from './Button.svelte';

    import { ArrowLeft, User, LogIn } from '@lucide/svelte';
    import IconSignInBold from 'phosphor-icons-svelte/IconSignInBold.svelte';

    interface NavLink {
        display: string;
        href: ResolvedPathname;
    }

    interface Props {
        user: Selectable<Users> | undefined;
        translations: Record<string, string>;
        links: NavLink[];
    }

    let showSidebar = $state(false);

    let { user, translations, links }: Props = $props();

    const toggleSidebar = (
        e: MouseEvent | KeyboardEvent,
        isBackdrop: boolean = false
    ) => {
        if (isBackdrop) {
            if (e.currentTarget === e.target) {
                showSidebar = !showSidebar;
            }
        } else {
            showSidebar = !showSidebar;
        }
    };

    let isHovering = $state(false);
    let turbulenceElement: SVGFETurbulenceElement;
    let animationFrame: number;

    function animateTurbulence() {
        if (!turbulenceElement) return;

        const current = parseFloat(
            turbulenceElement.getAttribute('baseFrequency') || '0'
        );
        const target = isHovering ? 0.01 : 0;
        const speed = 0.04; // Adjust for animation speed

        const diff = target - current;

        if (Math.abs(diff) > 0.00001) {
            const newValue = current + diff * speed; // Ease towards target
            turbulenceElement.setAttribute('baseFrequency', newValue.toString());
            animationFrame = requestAnimationFrame(animateTurbulence);
        } else {
            turbulenceElement.setAttribute('baseFrequency', target.toString());
        }
    }

    function handleMouseEnter() {
        isHovering = true;
        cancelAnimationFrame(animationFrame);
        animateTurbulence();
    }

    function handleMouseLeave() {
        isHovering = false;
        cancelAnimationFrame(animationFrame);
        animateTurbulence();
    }
</script>

<nav
    class="noise-contained bg-bg-900 fixed top-0 left-0 z-50 flex h-15 w-full flex-row items-center justify-between gap-5 px-16 pt-1 *:w-1/3">
    <div class="flex w-1/5 grow-0 flex-row items-center sm:grow">
        <div class="logo-continer relative flex justify-end sm:mr-0">
            <svg
                viewBox="0 0 180 100"
                preserveAspectRatio="xMidYMin slice"
                class="pointer-events-none absolute top-0 left-0 -z-5 select-none">
                <filter width="200%" height="200%" x="-50%" y="-50%" id="turbulance">
                    <feTurbulence
                        bind:this={turbulenceElement}
                        id="turbulance"
                        type="fractalNoise"
                        baseFrequency="0"
                        numOctaves="1"
                        result="turbulance"
                        seed="5">
                    </feTurbulence>
                    <feDisplacementMap
                        in="SourceGraphic"
                        in2="turbulence"
                        scale="30"
                        xChannelSelector="R"
                        yChannelSelector="R"></feDisplacementMap>
                </filter>
                <foreignObject width="100%" height="100%" overflow="visible"
                ></foreignObject>
            </svg>
            <a
                class="nav-option link"
                style="filter: url(#turbulance);"
                href={resolve('/')}
                aria-label="Home"
                onmouseenter={handleMouseEnter}
                onmouseleave={handleMouseLeave}>
                <img
                    src={asset('/assets/logo.svg')}
                    alt="SpetsCTF"
                    class="logo h-5 min-w-25 select-none" />
            </a>
        </div>
        <div class="mr-4 block {links.length > 3 ? 'md:hidden' : 'sm:hidden'}">
            <button
                class="ignore-default ml-2 flex flex-col gap-1.5"
                aria-label="Open Sidebar"
                onclick={toggleSidebar}>
                <Menu></Menu>
            </button>
        </div>
    </div>
    <ul
        class="hidden h-full min-w-fit flex-row items-center justify-center gap-8 {links.length >
        3
            ? 'md:flex'
            : 'sm:flex'}">
        {#each links as navLink, index (index)}
            <li>
                <a
                    rel="external"
                    class="nav-option link {page.url.pathname === navLink.href
                        ? 'text-text-150 font-semibold'
                        : ''}"
                    href={navLink.href}>{navLink.display}</a>
            </li>
        {/each}
    </ul>
    <div class="flex w-1/5 grow justify-end gap-3 overflow-y-hidden pr-0.5">
        {#if user}
            <a href={resolve('/user')} class="ignore-default max-w-full truncate">
                <!-- <div class="text-text-200 bg-bg-800 rounded-4xl px-3 py-2.5">tmp</div> -->
                <img
                    src={`https://avatars.githubusercontent.com/u/${user.github_id}?v=4`}
                    alt="User Avatar"
                    class="inline-block h-8 w-8 rounded-full align-middle" />
            </a>
        {:else}
            <Button
                bgColor="bg-bg-850"
                label={translations.login}
                type="button"
                onclick={() => goto(resolve('/login'))}
                Icon={IconSignInBold}
                aria-label="Sign in" />
        {/if}
    </div>
</nav>
{#if showSidebar}
    <div
        class="backdrop bg-backdrop fixed bottom-0 left-0 z-30 h-[calc(100vh-(15rem/4))] w-screen"
        onclick={(e: MouseEvent) => toggleSidebar(e, true)}
        onkeydown={(e) => {
            if (e.key === ' ' || e.key === 'Enter') toggleSidebar(e, true);
        }}
        aria-label="close-sidebar"
        role="button"
        tabindex="0">
        <nav
            class="bg-bg-900 border-r-primary bottom-0 z-40 flex h-full w-120 max-w-9/10 flex-col justify-between border-r-2 px-4 pb-8">
            <div>
                <div class="">
                    <button
                        aria-label="Close sidebar"
                        class="ignore-default"
                        onclick={toggleSidebar}>
                        <ArrowLeft />
                    </button>
                </div>
                <div class="w-full px-2">
                    <ul class="flex h-full flex-col items-stretch space-x-2 pr-5 pl-2">
                        {#each links as link (link.href)}
                            <li class="border-primary-light m-0 border-b-2 py-2 pl-1">
                                <a
                                    class="ignore-default hover:text-primary!"
                                    rel="external"
                                    href={link.href}
                                    onclick={(e) => {
                                        toggleSidebar(e, false);
                                    }}>{link.display}</a>
                            </li>
                        {/each}
                    </ul>
                </div>
            </div>
            <div class="px-4">
                {#if user}
                    <a
                        href={resolve('/user')}
                        onclick={(e) => {
                            toggleSidebar(e, false);
                        }}
                        class="ignore-default max-w-full space-x-4 truncate text-center underline">
                        <!-- <User class=" inline-block min-h-6 min-w-6" /> -->
                        <img
                            src={`https://avatars.githubusercontent.com/u/${user.github_id}?v=4`}
                            alt="User Avatar"
                            class="mx-1 inline-block h-6 w-6 rounded-full align-middle" />
                        {user.display_name || user.github_username}</a>
                {:else}
                    <Button
                        label={translations.login}
                        type="button"
                        responsiveStyles="!px-6 md:!px-8"
                        onclick={(e: MouseEvent) => {
                            goto(resolve('/login'));
                            toggleSidebar(e, false);
                        }}
                        Icon={LogIn}
                        aria-label="Login" />
                {/if}
            </div>
        </nav>
    </div>
{/if}
