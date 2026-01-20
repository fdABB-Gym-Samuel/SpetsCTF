<script lang="ts">
    import {
        Link,
        SquareTerminal,
        Copy,
        File,
        UserRoundPen,
        CircleX,
    } from '@lucide/svelte';
    import { applyAction, enhance } from '$app/forms';

    import { capitalizeFirstLetter } from '$lib/utils/utils';

    import Button from './Button.svelte';
    import { map } from '$lib/utils/utils';
    import { onMount, onDestroy } from 'svelte';
    import { categories } from '$lib/db/constants';
    import type { Selectable } from 'kysely';
    import type {
        ChallengeResources,
        Challenges,
        Flag,
        Users,
    } from '$lib/generated/db';
    import { invalidate } from '$app/navigation';
    import { resolve } from '$app/paths';
    import type { ActionData } from '../../routes/challenges/[challengeId]/$types';

    interface Props {
        challengeData: Selectable<Challenges> & {
            first_solvers: { display_name: string | null; id: string }[];
        } & { flag_format: Selectable<Flag>['flag_format'] } & {
            num_solvers: string | number | bigint;
        } & { resources: Selectable<ChallengeResources>[] } & { solved?: boolean };
        closeDialog: () => void;
        translations: Record<string, string>;
        user: Selectable<Users> | undefined;
        form: ActionData;
    }

    let { challengeData, closeDialog, translations, user, form }: Props = $props();

    function getPointColor(points: number): string {
        const labA = Math.floor(map(points, 0, 500, -128, 128));
        return `lab(90% ${labA} 128)`;
    }
    let pointElement: HTMLElement;
    $effect(() => {
        if (pointElement !== undefined) {
            pointElement.style.color = getPointColor(challengeData.points);
        }
    });

    let filteredCategories = categories.filter(
        (_, index) =>
            challengeData.challenge_sub_categories.split('').reverse().join('')[
                index
            ] === '1'
    );

    // Needs to be changed to handle when there are multiple commands that can be copied
    let showCopiedMessage = $state(false);

    async function copyToClipboard(text_to_copy: string) {
        try {
            await navigator.clipboard.writeText(text_to_copy).then(() => {
                showCopiedMessage = true;
                setTimeout(() => {
                    showCopiedMessage = false;
                }, 1000);
            });
        } catch (err) {
            console.error('Failed to copy!', err);
        }
    }

    let keydownHandler: (e: KeyboardEvent) => void;

    onMount(() => {
        keydownHandler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                closeDialog();
            }
        };

        document.addEventListener('keydown', keydownHandler);
    });

    onDestroy(() => {
        if (keydownHandler) {
            document.removeEventListener('keydown', keydownHandler);
        }
    });
</script>

<div
    class="prevent-default fixed top-0 left-0 z-20 flex h-screen w-screen items-center justify-center overflow-y-scroll pt-16">
    <button
        type="button"
        class="fixed inset-0 h-full w-full cursor-default focus:outline-none"
        onclick={(e) => {
            if (e.currentTarget === e.target) {
                closeDialog();
            }
        }}
        aria-label="Close challenge details"></button>
    <dialog
        class="bg-bg-800 challenge-dialog relative m-auto flex w-[85%] max-w-[1000px] flex-col overflow-y-scroll rounded-lg px-4 py-12 sm:px-8 md:px-10 lg:px-16">
        <section class="-mt-2 mb-12 flex w-full justify-between">
            {#if challengeData.created_at}
                <p class="text-primary-light text-md mb-0.5 font-mono font-bold">
                    {translations.uploaded}
                    {challengeData.created_at.toLocaleDateString('sv-SE')}
                </p>
            {:else}
                <p class="text-primary-light mb-0.5 font-mono text-sm font-bold">
                    {translations.unknown_creation_time}
                </p>
            {/if}
            <button
                type="button"
                onclick={() => closeDialog()}
                class="cursor-pointer"
                title="Close the challenge dialog.">
                <CircleX
                    color="var(--color-text-200)"
                    size="24"
                    class="hover:stroke-text-100 transition-colors" />
            </button>
        </section>
        <section class="top mb-6 flex w-full items-center justify-between">
            <h3 class="challenge-name text-text-100 text-xl font-bold">
                {challengeData.display_name}
            </h3>
        </section>
        <section
            class="middle text-foreground-dark mb-24 flex h-full w-full flex-row flex-wrap justify-center gap-y-8 overflow-hidden">
            <div class="w-1/2 min-w-70 flex-grow">
                <div class="mb-4 flex flex-col">
                    <p class="text-text-200">Resources:</p>
                    <ul class="resources flex flex-col gap-0 pl-4">
                        {#each challengeData.resources as resource (resource)}
                            {#if resource.type === 'web'}
                                <li
                                    class="challenge-resource text-text-100 flex h-fit flex-row items-center gap-1 underline">
                                    <Link class="size-4"></Link>
                                    <a
                                        rel="external"
                                        href={`${resource.content}`}
                                        class="ignore-default h-fit"
                                        >{new URL(resource.content).host}</a>
                                </li>
                            {:else if resource.type === 'file'}
                                <li
                                    class="challenge-resource text-text-100 flex flex-row items-center gap-1">
                                    <File class="size-4"></File>
                                    <a
                                        href={resolve(
                                            `/files/${resource.challenge}/${resource.content}`
                                        )}
                                        class="ignore-default h-fit">
                                        {resource.content
                                            .split('/')
                                            .at(-1)
                                            ?.slice(0, 35) ?? ''}
                                        {(resource.content.split('/').at(-1)?.length ??
                                            0) > 35
                                            ? '...'
                                            : ''}
                                    </a>
                                </li>
                            {:else}
                                <li
                                    class="challenge-resource text-text-100 flex flex-row items-center gap-1">
                                    <SquareTerminal class="size-4"></SquareTerminal>

                                    <p>
                                        {resource.content}
                                    </p>
                                    <button
                                        title="Copy to clipboard"
                                        class="ignore-default relative"
                                        onclick={() => {
                                            copyToClipboard(resource.content);
                                        }}>
                                        <Copy class="size-4"></Copy>
                                        {#if showCopiedMessage}
                                            <div
                                                class="bg-background-dark text-background-light absolute bottom-6 -translate-x-5 rounded-md px-2 py-2 text-xs">
                                                Copied!
                                            </div>
                                        {/if}
                                    </button>
                                </li>
                            {/if}
                        {/each}
                    </ul>
                </div>
                <div class="author mb-2">
                    <UserRoundPen
                        class="mb-0.5 inline-block"
                        color="var(--color-text-200)"
                        size="16"></UserRoundPen>
                    <p class="text-text-200 inline-block text-sm">Author:&nbsp;</p>
                    {#if !challengeData.author || challengeData.anonymous_author}
                        <p class="text-text-100 inline-block text-sm font-bold italic">
                            Anonymous
                        </p>
                    {:else}
                        <a
                            href={resolve(`/user/${challengeData.author}`)}
                            class="text-text-100 inline-block text-sm font-bold">
                            {challengeData.author}
                        </a>
                    {/if}
                </div>
                <div class="description">
                    <p class="text-text-200 inline-block text-sm">Description:&nbsp;</p>
                    <p
                        class="challenge-description text-text-100 mr-1 max-h-full overflow-scroll">
                        {challengeData.description}
                    </p>
                </div>
            </div>
            <div class="right w-1/2 min-w-70 flex-grow">
                {#if form}
                    <p
                        class:text-green-500={form.success}
                        class:text-red-500={!form.success}>
                        {form.message}
                    </p>
                {/if}
                {#if !challengeData.solved && user}
                    <form
                        action="?/submit"
                        method="post"
                        class="flag-submission-form max-w-full"
                        use:enhance={() => {
                            return async ({ result }) => {
                                invalidate(
                                    `data:challenge-${challengeData.challenge_id}`
                                );
                                applyAction(result);
                            };
                        }}>
                        <label for="flag" class="text-text-100 text-sm"
                            >Submit flag</label>
                        <div class="relative mt-2 mr-1 mb-8">
                            <input
                                type="text"
                                name="flag"
                                class="flag bg-bg-600 text-text-100 w-full rounded-xl px-6 py-1.5 font-mono focus:outline-none"
                                class:ring-error={form?.success === false}
                                placeholder={challengeData.flag_format} />
                            <input
                                type="hidden"
                                value={challengeData.challenge_id}
                                name="challenge_id" />
                            <div
                                class="absolute top-1/2 right-0 -translate-y-1/2 transform">
                                <Button
                                    label="Submit"
                                    type="submit"
                                    aria-label="Submit flag"
                                    bgColor="bg-bg-500"
                                    outlineColor="outline-transparent"
                                    hoverColor="hover:bg-secondary" />
                            </div>
                        </div>
                    </form>
                {:else if !user}
                    <div class="relative mt-4 mr-1 mb-8">
                        <p class="bg-bg-600 rounded-xl py-2 text-center font-semibold">
                            {translations.submission_needs_login}
                        </p>
                    </div>
                {:else}
                    <div class="relative mt-2 mr-1 mb-8">
                        <p
                            class="from-primary to-primary-light rounded-xl bg-gradient-to-br py-1 text-center font-semibold"
                            class:ring-correct={form?.success === true}>
                            {translations.challenge_already_solved}
                        </p>
                    </div>
                {/if}
                <div
                    class="first-solvers-wrapper text-text-100 flex flex-col justify-start">
                    {#if challengeData.num_solvers != 0}
                        <h5 class="text-text-200">First Solvers:</h5>
                        <ol
                            class="first-solvers flex list-inside list-decimal flex-col justify-start">
                            {#each challengeData.first_solvers as solver (solver.id)}
                                {#if solver.display_name}
                                    <li class="solver">
                                        {solver.display_name}
                                    </li>
                                {:else}
                                    <li class="solver italic">Anonymous</li>
                                {/if}
                            {/each}
                        </ol>
                    {:else}
                        <p>This challenge has no solvers yet.</p>
                    {/if}
                </div>
            </div>
        </section>
        <section class="flex w-full flex-wrap justify-between gap-x-12 gap-y-4">
            <ul
                class="categories @container flex h-fit w-fit flex-row flex-wrap"
                style="container-type:normal">
                {#each filteredCategories as category, index (index)}
                    <li
                        class="text-text-100 px-7 py-1 text-xs
            {index === 0 ? 'bg-gradient-100 rounded-l-xl rounded-bl-xl' : ''}
            {index === 1 ? 'bg-gradient-200' : ''}
            {index === 2 ? 'bg-gradient-300' : ''}
			{index > 2 ? 'bg-neutral-800' : ''}
            {index === filteredCategories.length - 1
                            ? 'rounded-r-xl rounded-br-xl'
                            : ''}">
                        <p>{capitalizeFirstLetter(category)}</p>
                    </li>
                {/each}
            </ul>
            <div class="flex flex-row gap-10">
                <p class="font-mono text-sm font-bold" bind:this={pointElement}>
                    <span class="mx-1 rounded-2xl bg-black"
                        >&nbsp;{challengeData.points}&nbsp;</span
                    >&nbsp;<span class="text-text-200">POINTS</span>
                </p>
                <p class="text-text-100 font-mono text-sm font-bold">
                    {challengeData.num_solvers}&nbsp;&nbsp;<span class="text-text-200">
                        {#if challengeData.num_solvers == 1}
                            SOLVER
                        {:else}
                            SOLVERS
                        {/if}
                    </span>
                </p>
            </div>
        </section>
    </dialog>
</div>

<style>
    @keyframes error-fade {
        0% {
            box-shadow:
                0 0 0 2px rgb(239, 68, 68),
                0 0 5px rgba(239, 68, 68, 0.6),
                0 0 10px rgba(239, 68, 68, 0.3);
        }
        100% {
            box-shadow:
                0 0 0 2px transparent,
                0 0 5px transparent,
                0 0 10px transparent;
        }
    }

    @keyframes correct-fade {
        0% {
            box-shadow:
                0 0 0 2px rgb(34, 197, 94),
                0 0 5px rgba(34, 197, 94, 0.6),
                0 0 10px rgba(34, 197, 94, 0.3);
        }
        100% {
            box-shadow:
                0 0 0 2px transparent,
                0 0 5px transparent,
                0 0 10px transparent;
        }
    }

    .ring-error {
        animation: error-fade 3s ease-in;
    }
    .ring-correct {
        animation: correct-fade 3s ease-in;
    }
</style>
