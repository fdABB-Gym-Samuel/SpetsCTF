<script lang="ts">
    import Button from '$lib/components/Button.svelte';
    import ButtonLink from '$lib/components/ButtonLink.svelte';
    import ChallengeList from '$lib/components/ChallengeList.svelte';
    import Switch from '$lib/components/input/Switch.svelte';
    import { enhance } from '$app/forms';
    import { goto } from '$app/navigation';

    let { data } = $props();

    let allChallenges = $derived(data.allChallenges);
    let myChallenges = $derived(data.myChallenges);
    let translations = $derived(data.translations);
    let user = $derived(data.user);

    import { Pen, Trash2, LogIn } from '@lucide/svelte';
    import IconCaretDownBold from 'phosphor-icons-svelte/IconCaretDownBold.svelte';
    import IconMagnifyingGlassBold from 'phosphor-icons-svelte/IconMagnifyingGlassBold.svelte';
    import IconArrowUpDownLeftBold from 'phosphor-icons-svelte/IconArrowUDownLeftBold.svelte';

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
</script>

<main class="content w-full pt-12 sm:m-auto">
    <header class="bg-bg-800 mb-6 rounded-[10px] p-2">
        <div class="flex h-10.5 items-center justify-between gap-24">
            <div class="flex h-full w-full gap-3">
                <div
                    class="bg-bg-850 flex min-w-max flex-row gap-1 rounded-lg p-1 *:flex *:items-center *:rounded-lg *:px-14">
                    <a
                        class:bg-bg-600={page.url.hash === '#all' || !page.url.hash}
                        class:text-text-200={page.url.hash === '#my'}
                        href="#all">
                        All challenges
                    </a>
                    <a
                        class:bg-bg-600={page.url.hash === '#my'}
                        class:text-text-200={page.url.hash === '#all'}
                        href="#my">
                        My challenges
                    </a>
                </div>
                <div class="relative">
                    <select
                        name="filter"
                        class="bg-bg-850 h-full w-56 appearance-none rounded-lg px-5 outline-0">
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
                        class="text-text-200 absolute top-1/2 right-4 -translate-y-1/2 transform text-[20px]" />
                </div>
                <div class="relative w-full">
                    <input
                        type="text"
                        name="search"
                        placeholder="Search"
                        class="bg-bg-850 placeholder:text-text-200 focus:bg-bg-700 h-full w-full rounded-lg px-5 pl-11 transition-colors outline-none" />
                    <IconMagnifyingGlassBold
                        class="text-text-200 absolute top-1/2 left-4 -translate-y-1/2 transform text-[20px]" />
                </div>
                <div class="text-text-150 mx-1.5 flex items-center gap-3">
                    <span>Solved</span>
                    <Switch />
                </div>
            </div>
            <button class="text-text-150 mr-2 flex cursor-pointer items-center gap-1.5">
                <span>Reset</span>
                <IconArrowUpDownLeftBold class="text-[20px]" />
            </button>
        </div>
    </header>
    <p class="text-text-150 mb-18 text-sm">
        Practise and gain points. Have a look at <span
            class="underline underline-offset-3">Learn</span> if you feel stuck.
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
<BackToTop />
