<script lang="ts">
    import Button from '$lib/components/Button.svelte';
    import ChallengeList from '$lib/components/ChallengeList.svelte';
    import Switch from '$lib/components/input/Switch.svelte';
    import { enhance } from '$app/forms';
    import { beforeNavigate, goto } from '$app/navigation';

    let { data } = $props();

    let allChallenges = $derived(data.allChallenges);
    let myChallenges = $derived(data.myChallenges);
    let translations = $derived(data.translations);
    let user = $derived(data.user);

    let currentTab = $derived(
        page.url.hash === '#my' ? 1 : page.url.hash === '#create' ? 2 : 0
    );

    import IconCaretDownBold from 'phosphor-icons-svelte/IconCaretDownBold.svelte';
    import IconMagnifyingGlassBold from 'phosphor-icons-svelte/IconMagnifyingGlassBold.svelte';
    import IconArrowUpDownLeftBold from 'phosphor-icons-svelte/IconArrowUDownLeftBold.svelte';
    import IconArrowRightBold from 'phosphor-icons-svelte/IconArrowRightBold.svelte';
    import IconListBold from 'phosphor-icons-svelte/IconListBold.svelte';
    import IconXBold from 'phosphor-icons-svelte/IconXBold.svelte';
    import IconTrashBold from 'phosphor-icons-svelte/IconTrashBold.svelte';
    import IconPencilBold from 'phosphor-icons-svelte/IconPencilBold.svelte';

    import Footer from '$lib/components/Footer.svelte';
    import { resolve } from '$app/paths';

    import { page } from '$app/state';
    import Input from '$lib/components/input/Input.svelte';
    import { formatRequestedName } from '$lib/utils/utils.js';

    let inputtedChallengeDisplayName = $state('');
    let derivedChallengeId = $derived(
        formatRequestedName(inputtedChallengeDisplayName)
    );

    let mobileFilterMenuOpen = $state(false);

    let content: HTMLElement | undefined = $state();

    let showSolved = $state(true);

    let showCategory = $state<string>('');

    let searchQuery = $state('');

    const resetFilters = () => {
        showSolved = true;
        showCategory = '';
        searchQuery = '';
    };

    let pageHeight = $state(0);
    let showFooter = $derived(pageHeight < 1800);

    beforeNavigate(() => {
        sessionStorage.setItem('challengesScroll', window.scrollY.toString());
    });
</script>

<svelte:body bind:clientHeight={pageHeight} />

<main class="w-full pt-12 sm:m-auto" bind:this={content}>
    <header class="bg-bg-800 mb-6 rounded-[10px] p-1.5">
        <div class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div class="flex gap-2 xl:hidden">
                <!-- Mobile header with hamburger -->
                <div class="flex w-full items-center justify-between">
                    <div
                        class="bg-bg-850 relative flex w-[30%] min-w-fit justify-evenly rounded-lg p-1 xl:hidden">
                        <!-- Sliding background indicator for mobile (3 tabs) -->
                        <div
                            class="bg-bg-600 absolute top-1 bottom-1 rounded-lg transition-all duration-300 ease-out"
                            style="left: {currentTab === 0
                                ? '0.25rem'
                                : currentTab === 1
                                  ? 'calc(33.333% + 0.083rem)'
                                  : 'calc(66.667% - 0.083rem)'}; 
							width: calc(33.333% - 0.167rem);">
                        </div>

                        <!-- Tab buttons -->
                        <a
                            href={resolve('/challenges')}
                            class="relative z-10 flex w-[calc(100%/3)] flex-1 items-center justify-center rounded-lg px-6 py-2 text-sm transition-colors duration-300"
                            class:text-text-200={currentTab !== 0}>
                            All
                        </a>
                        <a
                            href="#my"
                            class="relative z-10 flex w-[calc(100%/3)] flex-1 items-center justify-center rounded-lg px-6 py-2 text-sm transition-colors duration-300"
                            class:text-text-200={currentTab !== 1}>
                            My
                        </a>
                        <a
                            href="#create"
                            class="relative z-10 flex w-[calc(100%/3)] flex-1 items-center justify-center rounded-lg px-6 py-2 text-sm transition-colors duration-300"
                            class:text-text-200={currentTab !== 2}>
                            Create
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
            </div>

            <!-- Main content - responsive -->
            <div
                class="w-full flex-col gap-3 xl:flex-row {mobileFilterMenuOpen
                    ? 'flex'
                    : 'hidden xl:flex'}">
                <div class="flex w-full flex-col gap-x-3 gap-y-2 xl:flex-row">
                    <!-- Desktop tabs -->
                    <div
                        class="bg-bg-850 relative hidden w-full max-w-fit rounded-lg p-1 text-nowrap xl:flex">
                        <!-- Sliding background indicator for desktop (3 tabs) -->
                        <div
                            class="bg-bg-600 absolute top-1 bottom-1 rounded-lg transition-all duration-300 ease-out"
                            style="left: {currentTab === 0
                                ? '0.25rem'
                                : currentTab === 1
                                  ? 'calc(33.333% + 0.083rem)'
                                  : 'calc(66.667% - 0.083rem)'}; 
							width: calc(33.333% - 0.167rem);">
                        </div>

                        <!-- Tab buttons -->
                        <a
                            href={resolve('/challenges')}
                            class="relative z-10 flex w-[calc(100%/3)] items-center justify-center rounded-lg px-12 py-2 transition-colors duration-300"
                            class:text-text-200={currentTab !== 0}>
                            All challenges
                        </a>
                        <a
                            href="#my"
                            class="relative z-10 flex w-[calc(100%/3)] items-center justify-center rounded-lg px-12 py-2 transition-colors duration-300"
                            class:text-text-200={currentTab !== 1}>
                            My challenges
                        </a>
                        <a
                            href="#create"
                            class="relative z-10 flex w-[calc(100%/3)] items-center justify-center rounded-lg px-12 py-2 transition-colors duration-300"
                            class:text-text-200={currentTab !== 2}>
                            Create challenge
                        </a>
                    </div>

                    <!-- Filter dropdown -->
                    <div class="relative w-full xl:w-48">
                        <select
                            bind:value={showCategory}
                            name="filter"
                            class="bg-bg-850 h-10.5 w-full appearance-none rounded-lg px-5 pr-10 outline-0 xl:w-48">
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
                            bind:value={searchQuery}
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
                        <span class="text-sm lg:text-base">{translations.solved}</span>
                        <Switch bind:checked={showSolved} />
                    </div>
                </div>

                <!-- Reset button -->
                <button
                    onclick={() => {
                        resetFilters();
                    }}
                    class="text-text-150 flex cursor-pointer items-center justify-center gap-1.5 py-2 xl:mr-2.5 xl:justify-start xl:py-0">
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
    {#if currentTab === 0}
        <ChallengeList
            gotoChallenge={(challengeId) => {
                goto(resolve(`/challenges/${challengeId}`));
            }}
            challenges={allChallenges}
            bind:showSolved
            bind:showCategory
            bind:searchQuery></ChallengeList>
    {:else if currentTab === 1}
        {#if user}
            <section>
                {#if myChallenges && myChallenges?.length > 0}
                    <ul class="flex flex-col">
                        {#each myChallenges as challenge (challenge.challenge_id)}
                            <li
                                class="border-bg-800 flex h-16 w-full flex-row items-center justify-between border-b-2 px-4 py-2">
                                <p class="w-full">{challenge.challenge_name}</p>
                                <div
                                    class="ml-4 flex h-full flex-row items-center gap-2">
                                    <a
                                        href={resolve(
                                            `/challenges/${challenge.challenge_id}/edit`
                                        )}
                                        aria-label="Edit Challenge"
                                        class="bg-bg-700 text-text-150 hover:bg-bg-600 relative z-10 cursor-pointer rounded-lg p-2 transition-colors">
                                        <IconPencilBold class="text-[20px]" />
                                    </a>
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
                                        <button
                                            type="submit"
                                            aria-label="Delete challenge"
                                            class="bg-bg-700 text-text-150 hover:bg-bg-600 relative z-10 cursor-pointer rounded-lg p-2 transition-colors">
                                            <IconTrashBold class="text-[20px]" />
                                        </button>
                                    </form>
                                </div>
                            </li>
                        {/each}
                    </ul>
                {/if}
            </section>
        {:else}
            <p>Sign sign in to create a challenge.</p>
            <a href={resolve('/login')}>Sign in</a>
        {/if}
    {:else if currentTab === 2}
        <form class="m-auto w-fit pt-24" method="post" action="?/createChallenge">
            <div class="mb-6">
                <Input
                    label="Display name"
                    type="text"
                    name="name"
                    bind:value={inputtedChallengeDisplayName}
                    placeholder="Enter a display name"
                    required={true} />
                {#if derivedChallengeId}
                    <span class="text-text-200 pl-1 leading-loose"
                        >Challenge ID:&nbsp;&nbsp;<span class="font-mono"
                            >{derivedChallengeId}</span
                        ></span>
                {/if}
            </div>
            <Button
                label="Continue"
                type="submit"
                Icon={IconArrowRightBold}
                aria-label="Continue editing challenge"></Button>
        </form>
    {/if}
</main>

<div class:hidden={showFooter}>
    <Footer />
</div>
