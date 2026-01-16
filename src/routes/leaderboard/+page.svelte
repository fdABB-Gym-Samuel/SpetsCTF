<script lang="ts">
    import { resolve } from '$app/paths';

    let { data } = $props();
    let user = $derived(data.user);
    let usersScoreboard = $derived(data.usersScoreboard);
    let classesScoreboard = $derived(data.classesScoreboard);

    let originalClasses = $derived(classesScoreboard.map((elem) => elem.className));
    let includeClasses: string[] = $state([]);

    let filteredUsers = $derived.by(() => {
        if (includeClasses.length >= 1) {
            return usersScoreboard
                .filter(
                    (u) =>
                        u.represents_class &&
                        includeClasses.includes(u.represents_class)
                )
                .slice(0, 15);
        } else {
            return usersScoreboard;
        }
    });

    import BackToTop from '$lib/components/BackToTop.svelte';

    import { playAnimations } from '$lib/gsap/animations';
    import { onDestroy, onMount } from 'svelte';

    let componentRoot: HTMLElement;
    let gsapContext: gsap.Context | undefined;

    let userPosition = $derived(
        usersScoreboard.findIndex((user_) => user_.id === user?.id) + 1
    );
    let userClassPosition = $derived(
        classesScoreboard.findIndex(
            (class_) => class_.className === user?.represents_class
        ) + 1
    );
    onMount(() => {
        gsapContext = playAnimations(componentRoot);
    });

    onDestroy(() => {
        gsapContext?.revert();
    });
</script>

<main class="content m-auto w-full max-w-[1200px] pt-20" bind:this={componentRoot}>
    {#if user && !user.is_admin}
        <header class="gsap-top-down-opacity mb-12">
            <h1 class="text-xl font-bold">
                {user.display_name} <span class="text-text-200">#{userPosition}</span>
            </h1>
            <p class="text-text-200">
                You have <span class="text-text-100"
                    >{usersScoreboard.filter((user_) => user_.id === user.id)[0]
                        ?.total_points}pts</span
                >, currently in the
                <span class="text-text-100">#{userClassPosition} class</span>.
            </p>
        </header>
    {/if}
    <div class="scoreboards flex w-full flex-col gap-16">
        <section>
            <div class="mb-4 flex items-center justify-between">
                <h3 class="scoreboard-title gsap-top-down-opacity text-lg font-bold">
                    Users
                </h3>
                <div
                    class="class-filtering gsap-top-down-opacity flex flex-row flex-wrap items-center gap-1.5">
                    <p class="text-text-200 mr-2 text-sm">Filter:</p>
                    {#each originalClasses as cls (cls)}
                        <label
                            class="gsap-right-left-opacity relative cursor-pointer px-4 select-none">
                            <input
                                type="checkbox"
                                bind:group={includeClasses}
                                value={cls}
                                id={cls}
                                class="peer sr-only" />
                            <span
                                class="text-text-200 peer-checked:text-text-100 text-sm transition-colors"
                                >{cls}</span>
                            <span
                                class="bg-bg-800 peer-checked:bg-bg-700 absolute top-0.5 left-0 -z-10 h-5.5 w-full rounded-lg transition-colors"
                                aria-hidden="true"></span>
                        </label>
                    {/each}
                </div>
            </div>
            <div
                class="bg-bg-850 gsap-top-down-opacity max-h-[600px] w-full min-w-20 overflow-auto rounded-lg px-8 py-4">
                {#if filteredUsers.length === 0}
                    <p class="text-center text-sm text-red-500">
                        No users, please toggle at least one class.
                    </p>
                {:else}
                    <table class="gsap-top-down-opacity w-full table-fixed">
                        <thead>
                            <tr
                                class="*:bg-bg-800 min-w-20 *:py-2 [&>th:first-child]:rounded-l-lg [&>th:last-child]:rounded-r-lg">
                                <th
                                    class="text-text-200 w-12 pl-4 text-left font-medium sm:w-18 sm:pl-10"
                                    >#</th>
                                <th class="text-text-200 w-fit text-left font-medium"
                                    >Username</th>
                                <th
                                    class="text-text-200 w-14 pl-2 text-left font-medium sm:w-20 md:w-30 md:p-0 md:text-center"
                                    >Class</th>
                                <th
                                    class="text-text-200 w-18 pr-4 text-right font-medium sm:w-24 sm:pr-10"
                                    >Score</th>
                            </tr>
                        </thead>
                    </table>

                    <div class="h-4"></div>
                    <table class="gsap-top-down-opacity w-full table-fixed">
                        <tbody>
                            {#each filteredUsers as player, i (i)}
                                <tr
                                    class="*:border-bg-700 max-h-12 w-full text-wrap break-words *:border-t-0 [&>th:first-child]:rounded-l-lg [&>th:last-child]:rounded-r-lg
                        {i ===
                                    usersScoreboard
                                        .filter(
                                            (user) =>
                                                user.represents_class &&
                                                includeClasses.includes(
                                                    user.represents_class
                                                )
                                        )
                                        .slice(0, 15).length -
                                        1
                                        ? ''
                                        : '*:border-b-3'}
                        {i === 0
                                        ? 'text-primary'
                                        : i === 1
                                          ? 'text-primary-light'
                                          : i === 2
                                            ? 'text-primary-extra-light'
                                            : ''}"
                                    class:bg-bg-700={user?.id === player.id}>
                                    <td
                                        class="h-12 w-12 pl-4 text-left sm:w-18 sm:pl-10"
                                        >{i + 1}</td>
                                    <td
                                        class="h-12 max-h-12 w-fit overflow-hidden text-left break-normal text-ellipsis">
                                        {#if player.display_name && player.id}
                                            <a
                                                class="ignore-default"
                                                href={resolve(`/user/${player.id}`)}
                                                >{player.display_name}</a>
                                        {:else}
                                            <span class="italic">Anonymous</span>
                                        {/if}
                                    </td>
                                    <td
                                        class="h-12 w-14 pl-1 text-left sm:w-20 md:w-30 md:text-center"
                                        >{player?.represents_class}</td>
                                    <td
                                        class="h-12 w-18 pr-4 text-right sm:w-24 sm:pr-10"
                                        >{player.total_points == null
                                            ? 0
                                            : player.total_points}</td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                {/if}
            </div>
            <p class="text-text-200 gsap-top-down-opacity mt-2 ml-0.5">
                {usersScoreboard.length} users
            </p>
        </section>

        <section>
            <h3 class="scoreboard-title gsap-top-down-opacity mb-4 text-lg font-bold">
                Classes
            </h3>
            <div
                class="bg-bg-850 gsap-top-down-opacity max-h-[300px] w-full min-w-20 overflow-auto rounded-lg px-8 py-4">
                <!-- header only -->
                <table class="gsap-top-down-opacity w-full table-fixed">
                    <thead>
                        <tr
                            class="*:bg-bg-800 min-w-20
                     [&>th:first-child]:rounded-l-lg
                     [&>th:last-child]:rounded-r-lg">
                            <th
                                class="text-text-200 w-1/6 pl-4 text-left font-medium sm:pl-10"
                                >#</th>
                            <th
                                class="text-text-200 w-fit pl-4 text-left font-medium sm:pl-10"
                                >Class</th>
                            <th
                                class="text-text-200 w-fit pr-4 text-right font-medium sm:pr-10"
                                >Score</th>
                        </tr>
                    </thead>
                </table>

                <div class="h-4"></div>

                <!-- body only -->
                <table class="gsap-top-down-opacity w-full table-fixed">
                    <tbody>
                        {#each classesScoreboard.filter((class_) => class_.className !== 'No Class') as curr_class, i (String(curr_class.className))}
                            <tr
                                class="*:border-bg-700 w-full text-wrap break-words
                       *:border-t-0
                       {i === classesScoreboard.length - 1 ? '' : '*:border-b-3'}
                       {i === 0 ? 'text-secondary' : ''}">
                                <td class="h-12 w-1/6 px-2 pl-4 text-left sm:pl-10"
                                    >{i + 1}</td>
                                <td
                                    class="h-12 w-fit px-2 pl-4 text-left break-words sm:pl-10">
                                    {curr_class.className}
                                </td>
                                <td class="h-12 w-fit pr-4 text-right sm:pr-10">
                                    {curr_class.totalPoints}
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </section>
    </div>
</main>
<BackToTop />
