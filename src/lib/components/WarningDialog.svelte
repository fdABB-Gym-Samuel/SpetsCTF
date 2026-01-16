<script lang="ts">
    import { enhance } from '$app/forms';
    import { playAnimations } from '$lib/gsap/animations';

    import Button from './Button.svelte';
    import { onMount, onDestroy } from 'svelte';

    let {
        action,
        warningTitle,
        warningDescription,
        confirmationButtonText,
        confirmationButtonIcon,
        close,
        warningAria,
        hiddenName,
        hiddenData,
        form,
    } = $props();

    let closeDialog = $derived(close);

    let keydownHandler: (e: KeyboardEvent) => void;

    let gsapContext: gsap.Context | undefined;
    let componentRoot: HTMLElement;

    onMount(() => {
        gsapContext = playAnimations(componentRoot);

        keydownHandler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                closeDialog();
            }
        };

        document.addEventListener('keydown', keydownHandler);
    });

    onDestroy(() => {
        gsapContext?.revert();

        if (keydownHandler) {
            document.removeEventListener('keydown', keydownHandler);
        }
    });
</script>

<div
    bind:this={componentRoot}
    class="backdrop bg-overlay prevent-default fixed top-0 left-0 z-20 flex h-screen w-screen items-center justify-center overflow-y-scroll pt-16">
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
        class="bg-bg-800 gsap-opacity relative m-auto flex w-[85%] max-w-[1000px] flex-col overflow-y-scroll rounded-lg px-6 py-6 sm:px-8 md:px-10 lg:px-16">
        {#if form}
            <p class:text-green-500={form.success} class:text-red-500={!form.success}>
                {form.message}
            </p>
        {/if}
        <section class="flex w-full flex-col justify-between gap-y-8">
            <div>
                <h3 class="text-text-100 text-2xl">{warningTitle}</h3>
                <p class="text-text-100">{warningDescription}</p>
            </div>
            <div class="flex flex-row justify-end">
                <form {action} method="post" use:enhance class="flex gap-2">
                    <input type="hidden" name={hiddenName} value={hiddenData} />
                    <Button
                        label="Cancel"
                        aria-label="Cancel"
                        type="button"
                        styleType="small"
                        onclick={closeDialog}
                        textColor="text-text-100"></Button>
                    <Button
                        label={confirmationButtonText}
                        aria-label={warningAria}
                        type="submit"
                        styleType="small"
                        Icon={confirmationButtonIcon}
                        bgColor="bg-red-700"
                        hoverColor="hover:bg-red-500"
                        textColor="text-text-100"></Button>
                </form>
            </div>
        </section>
    </dialog>
</div>
