<script lang="ts">
    import Button from '$lib/components/Button.svelte';
    import ButtonLink from '$lib/components/ButtonLink.svelte';
    import ChallengeList from '$lib/components/ChallengeList.svelte';
    import Switch from '$lib/components/input/Switch.svelte';
    import { enhance } from '$app/forms';
    import { goto } from '$app/navigation';

    import { slide } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';

    let { data } = $props();

    let allChallenges = $derived(data.allChallenges);
    let myChallenges = $derived(data.myChallenges);
    let translations = $derived(data.translations);
    let user = $derived(data.user);

    let isMyTab = $derived(page.url.hash === '#my');

    import { Pen, Trash2, LogIn } from '@lucide/svelte';
    import IconCaretDownBold from 'phosphor-icons-svelte/IconCaretDownBold.svelte';
    import IconMagnifyingGlassBold from 'phosphor-icons-svelte/IconMagnifyingGlassBold.svelte';
    import IconArrowUpDownLeftBold from 'phosphor-icons-svelte/IconArrowUDownLeftBold.svelte';
    import IconArrowUpRightBold from 'phosphor-icons-svelte/IconArrowUpRightBold.svelte';
    import IconListBold from 'phosphor-icons-svelte/IconListBold.svelte';
    import IconXBold from 'phosphor-icons-svelte/IconXBold.svelte';

    import BackToTop from '$lib/components/BackToTop.svelte';
    import HSeperator from '$lib/components/HSeperator.svelte';
    import { resolve } from '$app/paths';

    import { page } from '$app/state';
    import Input from '$lib/components/input/Input.svelte';
    import { formatRequestedName } from '$lib/utils/utils.js';

    let inputtedChallengeDisplayName = $state('');
    let derivedChallengeId = $derived(
        formatRequestedName(inputtedChallengeDisplayName)
    );

    let mobileFilterMenuOpen = $state(false);
</script>

<main class="content w-full pt-12 sm:m-auto">
    <header class="bg-bg-800 mb-6 rounded-[10px] p-1.5">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <!-- Mobile header with hamburger -->
            <div class="flex items-center justify-between lg:hidden">
                <div class="bg-bg-850 relative flex gap-1 rounded-lg p-1 lg:hidden">
                    <!-- Sliding background indicator -->
                    <div
                        class="bg-bg-600 absolute top-1 bottom-1 rounded-lg transition-all duration-300 ease-out"
                        style="left: {isMyTab
                            ? 'calc(50% + 0.125rem)'
                            : '0.25rem'}; right: {isMyTab
                            ? '0.25rem'
                            : 'calc(50% + 0.125rem)'};">
                    </div>

                    <!-- Tab buttons -->
                    <a
                        href="#all"
                        class="relative z-10 flex flex-1 items-center justify-center rounded-lg px-8 py-2 text-sm transition-colors duration-300"
                        class:text-text-200={isMyTab}>
                        All
                    </a>
                    <a
                        href="#my"
                        class="relative z-10 flex flex-1 items-center justify-center rounded-lg px-8 py-2 text-sm transition-colors duration-300"
                        class:text-text-200={!isMyTab}>
                        My
                    </a>
                </div>
                <button
                    onclick={() => (mobileFilterMenuOpen = !mobileFilterMenuOpen)}
                    class="text-text-200 mr-1 cursor-pointer p-2"
                    aria-label="Toggle filter menu">
                    {#if mobileFilterMenuOpen}
                        <IconXBold class="text-text-150 text-[24px]" />
                    {:else}
                        <IconListBold class="text-text-150 text-[24px]" />
                    {/if}
                </button>
            </div>

            <!-- Main content - responsive -->
            <div
                class="w-full flex-col gap-3 lg:flex-row {mobileFilterMenuOpen
                    ? 'flex'
                    : 'hidden lg:flex'}">
                <div class="flex w-full flex-col gap-x-3 gap-y-2 lg:flex-row">
                    <!-- Desktop tabs -->
                    <div
                        class="bg-bg-850 relative hidden min-w-max flex-row gap-1 rounded-lg p-1 text-nowrap lg:flex">
                        <!-- Sliding background indicator -->
                        <div
                            class="bg-bg-600 absolute top-1 bottom-1 rounded-lg transition-all duration-300 ease-out"
                            style="left: {isMyTab
                                ? 'calc(50% + 0.125rem)'
                                : '0.25rem'}; right: {isMyTab
                                ? '0.25rem'
                                : 'calc(50% + 0.125rem)'};">
                        </div>

                        <!-- Tab buttons -->
                        <a
                            href="#all"
                            class="relative z-10 flex items-center rounded-lg px-14 py-2 transition-colors duration-300"
                            class:text-text-200={isMyTab}>
                            All challenges
                        </a>
                        <a
                            href="#my"
                            class="relative z-10 flex items-center rounded-lg px-14 py-2 transition-colors duration-300"
                            class:text-text-200={!isMyTab}>
                            My challenges
                        </a>
                    </div>

                    <!-- Filter dropdown -->
                    <div class="relative w-full lg:w-56">
                        <select
                            name="filter"
                            class="bg-bg-850 h-10.5 w-full appearance-none rounded-lg px-5 pr-10 outline-0 lg:w-56">
                            <option value="">All</option>
                            <option value="crypto">Crypto</option>
                            <option value="forensics">Forensics</option>
                            <option value="introduction">Introduction</option>
                            <option value="misc">Misc</option>
                            <option value="osint">OSINT</option>
                            <option value="pwn">Pwn</option>
                            <option value="reversing">Reversing</option>
                            <option value="web">Web</option>
                        </select>
                        <IconCaretDownBold
                            class="text-text-200 pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 transform text-[20px]" />
                    </div>

                    <!-- Search input -->
                    <div class="relative w-full">
                        <input
                            type="text"
                            name="search"
                            placeholder="Search"
                            class="bg-bg-850 placeholder:text-text-200 focus:bg-bg-700 h-10.5 w-full rounded-lg px-5 pl-11 transition-colors outline-none" />
                        <IconMagnifyingGlassBold
                            class="text-text-200 absolute top-1/2 left-4 -translate-y-1/2 transform text-[20px]" />
                    </div>

                    <!-- Solved toggle -->
                    <div
                        class="text-text-150 my-2 ml-2 flex items-center gap-3 lg:mx-1.5 lg:my-0">
                        <span class="text-sm lg:text-base">Solved</span>
                        <Switch />
                    </div>
                </div>

                <!-- Reset button -->
                <button
                    class="text-text-150 flex cursor-pointer items-center justify-center gap-1.5 py-2 lg:mr-2.5 lg:justify-start lg:py-0">
                    <span>Reset</span>
                    <IconArrowUpDownLeftBold class="text-[20px]" />
                </button>
            </div>
        </div>
    </header>

    <p class="text-text-150 mb-18 text-sm">
        Practise and gain points. Have a look at <a
            href={resolve('/learn')}
            class="underline underline-offset-2">Learn</a> if you feel stuck.
    </p>
    {#if page.url.hash === '#all' || !page.url.hash}
        <ChallengeList
            gotoChallenge={(challengeId) => {
                goto(resolve(`/challenges/${challengeId}`));
            }}
            challenges={allChallenges}></ChallengeList>
    {:else if page.url.hash === '#my'}
        {#if user}
            <section>
                {#if myChallenges && myChallenges?.length > 0}
                    <ul class="flex flex-col">
                        {#each myChallenges as challenge (challenge.challenge_id)}
                            <li
                                class="border-bg-500 flex h-16 w-full flex-row items-center justify-between border-b-2 px-4 py-2">
                                <p class="w-full">{challenge.challenge_name}</p>
                                <HSeperator color="bg-bg-500"></HSeperator>
                                <div
                                    class="ml-4 flex h-full flex-row items-center gap-2">
                                    <ButtonLink
                                        label=""
                                        aria-label="Edit Challenge"
                                        type="button"
                                        styleType="icon"
                                        href={resolve(
                                            `/challenges/${challenge.challenge_id}/edit`
                                        )}
                                        Icon={Pen}></ButtonLink>
                                    <form
                                        method="post"
                                        action="?/deleteChallenge"
                                        use:enhance={({ cancel }) => {
                                            const ok = confirm(
                                                `Do you really want to delete challenge ${challenge.challenge_name}?`
                                            );
                                            if (!ok) {
                                                cancel();
                                            }
                                        }}>
                                        <input
                                            type="hidden"
                                            name="challengeId"
                                            value={challenge.challenge_id} />
                                        <Button
                                            label=""
                                            aria-label="Delete challenge"
                                            type="submit"
                                            styleType="icon"
                                            bgColor="bg-red-700"
                                            Icon={Trash2}></Button>
                                    </form>
                                </div>
                            </li>
                        {/each}
                    </ul>
                {/if}
            </section>
        {:else}
            <ButtonLink
                label={translations.login}
                href={resolve('/login')}
                Icon={LogIn}
                aria-label="Login" />
        {/if}
    {:else if page.url.hash == '#create'}
        <form
            class="flex w-fit flex-col space-y-4"
            method="post"
            action="?/createChallenge">
            <Input
                label="Display name"
                type="text"
                name="name"
                bind:value={inputtedChallengeDisplayName}
                placeholder="Enter a display name"
                required={true} />
            {#if derivedChallengeId}
                <span
                    >Challenge ID: <span class="font-mono">{derivedChallengeId}</span
                    ></span>
            {/if}
            <Button
                label="Create Challenge"
                type="submit"
                Icon={Pen}
                aria-label="Go to challenges"></Button>
        </form>
    {/if}
</main>

<footer class="mt-64 flex w-full flex-col items-center justify-center">
    <BackToTop />
    <div
        class="text-text-150 mt-64 mb-4 flex w-full flex-wrap justify-between gap-x-8 gap-y-12 text-sm sm:gap-y-4">
        <div class="flex flex-wrap gap-x-12 gap-y-1">
            <div class="*:inline-block">
                <p class="mr-4 min-w-max">
                    This project is open-source, feel free to help.
                </p>
                <a
                    class="text-text-200 *:inline-block"
                    href="https://github.com/fdABB-Gym-Samuel/SpetsCTF"
                    target="_blank"
                    >Contribute <IconArrowUpRightBold class="text-base" /></a>
            </div>
            <p>
                Encounter any issues? Reach out to <span class="font-semibold"
                    >Samuel Olsson</span>
                or <span class="font-semibold">Eric Thorburn</span> on teams.
            </p>
        </div>
        <div class="flex flex-wrap gap-x-4">
            <p>&copy; {new Date().getFullYear()} spetsen.net</p>
            <p class="text-text-200">Design by Hannes Gingby</p>
        </div>
    </div>
</footer>
