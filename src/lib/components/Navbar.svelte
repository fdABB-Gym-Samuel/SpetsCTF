<script lang="ts">
    import { goto } from '$app/navigation';
    import type { Users } from '$lib/generated/db';
    import type { Selectable } from 'kysely';

    import { enhance } from '$app/forms';
    import VSeperator from './VSeperator.svelte';

    import { page } from '$app/state';
    import { asset, resolve } from '$app/paths';
    import type { ResolvedPathname } from '$app/types';

    import Button from './Button.svelte';

    import IconSignInBold from 'phosphor-icons-svelte/IconSignInBold.svelte';
    import IconListBold from 'phosphor-icons-svelte/IconListBold.svelte';
    import IconXBold from 'phosphor-icons-svelte/IconXBold.svelte';

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
    let showAvatarPopup = $state(false);

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

    const toggleAvatarPopup = () => {
        showAvatarPopup = !showAvatarPopup;
    };

    const closeAvatarPopup = () => {
        showAvatarPopup = false;
    };

    const closeAvatarPopupBackdrop = (e: MouseEvent | KeyboardEvent) => {
        if (e.currentTarget === e.target) {
            showAvatarPopup = false;
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
    class="bg-bg-900 fixed top-0 left-0 z-50 flex h-15 w-full flex-row items-center justify-between gap-5 px-3 pt-1 *:w-1/3 lg:px-8 xl:px-16">
    <div class="flex w-1/5 grow-0 flex-row items-center gap-x-2 sm:grow">
        <div class="block {links.length > 3 ? 'md:hidden' : 'sm:hidden'}">
            <button
                class="ignore-default ml-1 flex flex-col"
                aria-label="Toggle Sidebar"
                onclick={toggleSidebar}>
                {#if !showSidebar}
                    <IconListBold class="text-text-150 text-[24px]" />
                {:else}
                    <IconXBold class="text-text-150 text-[24px]" />
                {/if}
            </button>
        </div>
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
    </div>
    <ul
        class="hidden h-full min-w-fit flex-row items-center justify-center gap-8 {links.length >
        3
            ? 'md:flex'
            : 'sm:flex'}">
        {#each links as navLink, index (index)}
            <li>
                <!-- eslint-disable svelte/no-navigation-without-resolve -->
                <a
                    class="nav-option link {page.url.pathname === navLink.href
                        ? 'text-text-150 font-semibold'
                        : ''}"
                    href={navLink.href}>
                    {navLink.display}
                </a>
                <!-- eslint-enable svelte/no-navigation-without-resolve -->
            </li>
        {/each}
    </ul>
    <div class="relative flex w-1/5 grow justify-end gap-3 overflow-y-hidden pr-0.5">
        {#if user}
            <button
                onclick={toggleAvatarPopup}
                aria-label="User menu"
                class="ignore-default max-w-full cursor-pointer truncate">
                <img
                    src={`https://avatars.githubusercontent.com/u/${user.github_id}?v=4`}
                    alt="User Avatar"
                    class="inline-block h-8 w-8 rounded-full align-middle" />
            </button>
        {:else}
            <Button
                label={translations.login}
                type="button"
                onclick={() => goto(resolve('/login'))}
                Icon={IconSignInBold}
                aria-label="Sign in" />
        {/if}
    </div>
</nav>

{#if showAvatarPopup && user}
    <div
        class="fixed inset-0 z-50"
        onclick={closeAvatarPopupBackdrop}
        onkeydown={(e) => {
            if (e.key === ' ' || e.key === 'Enter') closeAvatarPopupBackdrop(e);
        }}
        aria-label="close avatar menu"
        role="button"
        tabindex="0">
        <div
            class="bg-bg-700 text-text-150 fixed top-16 right-3 z-50 min-w-54 rounded-lg p-2 shadow-lg lg:right-8 xl:right-16"
            role="menu"
            onclick={(e) => e.stopPropagation()}
            onkeydown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') e.stopPropagation();
            }}
            tabindex="-1">
            <div
                class="*:hover:bg-bg-600 flex flex-col *:rounded-sm *:px-2 *:py-1.5 *:transition-colors">
                <a href={resolve(`/user/${user.id}`)} onclick={closeAvatarPopup}
                    >Profile</a>
                <a href={resolve('/user')} onclick={closeAvatarPopup}>Account</a>
            </div>
            <div class="my-1">
                <VSeperator color="bg-bg-600" />
            </div>
            <form
                class="*:hover:bg-bg-600 w-full *:w-full *:rounded-sm *:px-2 *:py-1.5 *:text-left *:transition-colors"
                method="post"
                action="/user?/logout"
                use:enhance={() => {
                    return async ({ result }) => {
                        if (result.type === 'success') {
                            await goto(resolve('/'), { invalidateAll: true });
                        }
                    };
                }}>
                <button type="submit" class="cursor-pointer">
                    <span>Sign out</span>
                </button>
            </form>
        </div>
    </div>
{/if}

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
            class="bg-bg-900 bottom-0 z-40 flex h-full w-full max-w-4/5 flex-col justify-between px-4 pb-8">
            <div class="mt-12 w-full px-2">
                <ul
                    class="flex h-full flex-col items-stretch gap-3 space-x-2 pr-5 pl-2">
                    {#each links as link (link.href)}
                        <li class="border-primary-light m-0 border-b-2 py-4 pl-1">
                            <a
                                class="ignore-default hover:text-text-150"
                                rel="external"
                                href={link.href}
                                onclick={(e) => {
                                    toggleSidebar(e, false);
                                }}>{link.display}</a>
                        </li>
                    {/each}
                </ul>
            </div>
        </nav>
    </div>
{/if}
