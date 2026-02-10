<script lang="ts">
    import { goto } from '$app/navigation';

    import IconFileBold from 'phosphor-icons-svelte/IconFileBold.svelte';
    import IconTerminalBold from 'phosphor-icons-svelte/IconTerminalBold.svelte';
    import IconGlobeBold from 'phosphor-icons-svelte/IconGlobeBold.svelte';
    import IconArrowBendUpRightBold from 'phosphor-icons-svelte/IconArrowBendUpRightBold.svelte';
    import IconCopyBold from 'phosphor-icons-svelte/IconCopyBold.svelte';

    import { applyAction, enhance } from '$app/forms';

    import { capitalizeFirstLetter } from '$lib/utils/utils';

    import Button from './Button.svelte';
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

    import { getPointBracket } from '$lib/utils/utils';

    interface Props {
        challengeData: Omit<Selectable<Challenges>, 'flag' | 'migrate_to_wargames'> & {
            first_solvers: { display_name: string | null; id: string }[];
        } & { flag_format: Selectable<Flag>['flag_format'] } & {
            num_solvers: string | number | bigint;
        } & { resources: Selectable<ChallengeResources>[] } & {
            solved?: boolean;
        } & { author_id: string | null };
        closeDialog: () => void;
        translations: Record<string, string>;
        user: Selectable<Users> | undefined;
        form: ActionData;
    }

    let { challengeData, closeDialog, translations, user, form }: Props = $props();

    let pointBracket = $derived(getPointBracket(challengeData.points));

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

<div class="fixed inset-0 overflow-y-auto pt-12 sm:pt-24 md:pt-36">
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
        class="bg-bg-800 challenge-dialog relative mx-auto flex w-[95%] max-w-[1400px] flex-col rounded-2xl px-8 py-12 sm:px-12 md:w-[85%] md:px-14 lg:px-16">
        <section
            class="-mt-2 mb-12 flex w-full flex-wrap items-center justify-between gap-x-8 gap-y-1 text-nowrap">
            <section>
                <h3 class="challenge-name text-text-100 text-[22px] font-semibold">
                    {challengeData.display_name}
                </h3>
            </section>
            {#if challengeData.created_at}
                <p class="text-md text-text-100 mb-0.5">
                    {translations.uploaded}
                    {challengeData.created_at.toLocaleDateString('sv-SE')}
                </p>
            {:else}
                <p class="text-text-100 mb-0.5">
                    {translations.unknown_creation_time}
                </p>
            {/if}
        </section>
        <section
            class="middle mb-24 flex h-full w-full flex-row flex-wrap justify-center gap-x-4 gap-y-8 *:w-full">
            <div class="w-1/2 min-w-70 grow">
                {#if challengeData.resources.length != 0}
                    <div class="mb-4 flex flex-col">
                        <p class="text-text-100 mb-2">Resources:</p>
                        <ul
                            class="resources *:bg-bg-600 flex flex-col gap-1 *:w-fit *:rounded-full *:py-1 *:pr-5 *:pl-4">
                            {#each challengeData.resources as resource (resource)}
                                {#if resource.type === 'web'}
                                    <li
                                        class="challenge-resource text-text-100 flex h-fit flex-row items-center gap-1 underline select-none">
                                        <IconGlobeBold
                                            class="text-text-150 text-[20px]" />
                                        <a
                                            rel="external"
                                            href={`${resource.content}`}
                                            class="ignore-default h-fit"
                                            >{new URL(resource.content).host}</a>
                                    </li>
                                {:else if resource.type === 'file'}
                                    <li
                                        class="challenge-resource text-text-100 flex flex-row items-center gap-1 select-none">
                                        <IconFileBold
                                            class="text-text-150 text-[20px]" />
                                        <a
                                            href={resolve(
                                                `/files/${resource.challenge}/${resource.content}`
                                            )}
                                            class="ignore-default h-fit">
                                            {resource.content
                                                .split('/')
                                                .at(-1)
                                                ?.slice(0, 35) ?? ''}
                                            {(resource.content.split('/').at(-1)
                                                ?.length ?? 0) > 35
                                                ? '...'
                                                : ''}
                                        </a>
                                    </li>
                                {:else}
                                    <li
                                        class="challenge-resource text-text-100 flex flex-row items-center gap-1 select-none">
                                        <IconTerminalBold
                                            class="text-text-150 text-[20px]" />
                                        <button
                                            title="Copy to clipboard"
                                            class="ignore-default relative cursor-pointer *:inline-block"
                                            onclick={() => {
                                                copyToClipboard(resource.content);
                                            }}>
                                            <p>
                                                {resource.content}
                                            </p>
                                            <IconCopyBold class="ml-1 text-[20px]" />
                                            {#if showCopiedMessage}
                                                <div
                                                    class="bg-bg-600 absolute bottom-6 -translate-x-4 rounded-lg px-2 py-0.5 text-sm">
                                                    Copied!
                                                </div>
                                            {/if}
                                        </button>
                                    </li>
                                {/if}
                            {/each}
                        </ul>
                    </div>
                {/if}
                <div class="author mb-2">
                    <p class="text-text-100 inline-block">Author:&nbsp;</p>
                    {#if !challengeData.author || challengeData.anonymous_author}
                        <p class="text-text-100 inline-block italic">Anonymous</p>
                    {:else}
                        <a
                            href={resolve(`/user/${challengeData.author_id}`)}
                            class="text-text-100 inline-block">
                            {challengeData.author}
                        </a>
                    {/if}
                </div>
                <div class="description">
                    <p
                        class="challenge-description text-text-100 mr-1 max-h-full wrap-break-word">
                        {challengeData.description}
                    </p>
                </div>
            </div>
            <div class="w-1/2 min-w-70 grow">
                {#if form}
                    <p
                        class="mb-3"
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
                        <label for="flag" class="text-text-100">Submit flag</label>
                        <div class="relative mt-2 mr-1 mb-8">
                            <input
                                type="text"
                                name="flag"
                                class="flag bg-bg-600 text-text-100 w-full rounded-lg px-6 py-3 font-mono focus:outline-none"
                                class:ring-error={form?.success === false}
                                placeholder={challengeData.flag_format} />
                            <input
                                type="hidden"
                                value={challengeData.challenge_id}
                                name="challenge_id" />
                            <div
                                class="absolute top-1/2 right-1 -translate-y-1/2 transform">
                                <Button
                                    label="Submit"
                                    Icon={IconArrowBendUpRightBold}
                                    type="submit"
                                    aria-label="Submit flag" />
                            </div>
                        </div>
                    </form>
                {:else if !user}
                    <div class="relative mt-4 mr-1 mb-8">
                        <p class="text-text-100 mb-3">
                            {translations.submission_needs_login}
                        </p>
                        <Button
                            label="Sign in"
                            inverted={true}
                            onclick={() => {
                                goto(resolve('/login'));
                            }}></Button>
                    </div>
                {:else}
                    <div class="relative mt-2 mr-1 mb-8">
                        <p
                            class="from-primary to-primary-light text-text-100 rounded-lg bg-linear-to-br py-1 text-center font-semibold"
                            class:ring-correct={form?.success === true}>
                            {translations.challenge_already_solved}
                        </p>
                    </div>
                {/if}
                <div
                    class="first-solvers-wrapper text-text-100 flex flex-col justify-start">
                    {#if challengeData.num_solvers != 0}
                        <h5 class="text-text-100 mb-2">First Solvers:</h5>
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
                        <p class="text-text-100">This challenge has no solvers yet.</p>
                    {/if}
                </div>
            </div>
        </section>
        <section class="flex w-full flex-wrap justify-between gap-x-12 gap-y-4">
            <ul
                class="categories @container flex h-fit w-fit flex-row flex-wrap space-x-4"
                style="container-type:normal">
                {#each filteredCategories as category, index (index)}
                    <li class="text-text-100 text-md">
                        <p>{capitalizeFirstLetter(category)}</p>
                    </li>
                {/each}
            </ul>
            <div class="flex flex-row gap-8">
                <p class="text-md font-mono font-bold">
                    <span
                        class:text-text-100={challengeData.solved}
                        class:text-point-100={!challengeData.solved &&
                            pointBracket === 100}
                        class:text-point-200={!challengeData.solved &&
                            pointBracket === 200}
                        class:text-point-300={!challengeData.solved &&
                            pointBracket === 300}
                        class:text-point-400={!challengeData.solved &&
                            pointBracket === 400}
                        class:text-point-500={!challengeData.solved &&
                            pointBracket === 500}>{challengeData.points}</span
                    >&nbsp;<span class="text-text-100">POINTS</span>
                </p>
                <p class="text-text-100 text-md font-mono font-bold">
                    {challengeData.num_solvers}&nbsp;<span class="text-text-100">
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
