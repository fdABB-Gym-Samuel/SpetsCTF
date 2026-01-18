<script lang="ts">
    import Button from '$lib/components/Button.svelte';
    import ButtonLink from '$lib/components/ButtonLink.svelte';
    import Input from '$lib/components/input/Input.svelte';

    import { goto } from '$app/navigation';
    import { page } from '$app/state';
    import ChallengeList from '$lib/components/ChallengeList.svelte';

    import { formatRequestedName } from '$lib/utils/utils';

    let { data } = $props();

    let allChallenges = $derived(data.allChallenges);
    let myChallenges = $derived(data.myChallenges);
    let translations = $derived(data.translations);
    let user = $derived(data.user);

    import { Search, ChevronDown, Pen, Trash2, LogIn } from '@lucide/svelte';
    import VSeperator from '$lib/components/VSeperator.svelte';
    import BackToTop from '$lib/components/BackToTop.svelte';
    import HSeperator from '$lib/components/HSeperator.svelte';
    import { resolve } from '$app/paths';
    import { enhance } from '$app/forms';

    let inputtedChallengeDisplayName = $state('');
    let derivedChallengeId = $derived(
        formatRequestedName(inputtedChallengeDisplayName)
    );
</script>

<main class="content w-[100%] pt-20 sm:m-auto">
    <header class="mb-16 flex flex-col items-center justify-center gap-3">
        <p class="text-text-200">Challenge yourself, practise and gain points.</p>
        <div class="flex flex-wrap items-center justify-center gap-4">
            <div class="relative">
                <input
                    type="text"
                    name="search"
                    placeholder="Search"
                    class="bg-bg-800 placeholder:text-text-200 focus:bg-bg-700 h-8 max-w-96 rounded-lg px-5 transition-colors outline-none" />
                <Search
                    strokeWidth="3"
                    size="20"
                    color="var(--color-text-200)"
                    class="absolute top-1/2 right-4 -translate-y-1/2 transform" />
            </div>
            <div class="relative">
                <select
                    name="filter"
                    class="bg-bg-800 h-8 w-48 appearance-none rounded-lg px-5">
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
                <ChevronDown
                    strokeWidth="3"
                    size="20"
                    color="var(--color-text-200)"
                    class="absolute top-1/2 right-4 -translate-y-1/2 transform" />
            </div>
        </div>
    </header>
    <nav class="flex w-full flex-col gap-2">
        <ul class="flex w-full flex-row gap-5">
            <li>
                <a
                    href="#all"
                    class:border-b-2={page.url.hash === '#all' || !page.url.hash}>
                    All Challenges
                </a>
            </li>
            <li>
                <a href="#my" class:border-b-2={page.url.hash === '#my'}>
                    My Challenges
                </a>
            </li>
            <li>
                <a href="#create" class:border-b-2={page.url.hash === '#create'}>
                    Create Challenge
                </a>
            </li>
        </ul>
        <VSeperator></VSeperator>
    </nav>
    {#if page.url.hash === '#all' || !page.url.hash}
        <ChallengeList
            gotoChallenge={(challengeId) => {
                goto(resolve(`/ctf/${page.params.ctfId}/challenges/${challengeId}`));
            }}
            challenges={allChallenges}></ChallengeList>
    {:else if page.url.hash === '#my'}
        {#if user}
            <section>
                {#if myChallenges !== null && myChallenges?.length > 0}
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
                                        action="/challenges?/deleteChallenge"
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
                type="button"
                href={resolve('/login')}
                Icon={LogIn}
                aria-label="Login" />
        {/if}
    {:else if page.url.hash == '#create'}
        <form
            class="flex w-fit flex-col space-y-4"
            method="post"
            action="/challenges?/createChallenge">
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
            {#if data.ctfData}
                <input type="hidden" name="ctfId" value={data.ctfData.id} />
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
