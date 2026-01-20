<script lang="ts">
    import { resolve } from '$app/paths';

    let { data } = $props();
    let nextCtf = $derived(data.nextCtf);

    import IconArrowRightBold from 'phosphor-icons-svelte/IconArrowRightBold.svelte';
    import IconGraduationCapBold from 'phosphor-icons-svelte/IconGraduationCapBold.svelte';

    import { goto } from '$app/navigation';

    import Button from '$lib/components/Button.svelte';
    import Countdown from '$lib/components/Countdown.svelte';
</script>

<main class="m-auto max-w-130 pt-48">
    <div class="mb-16">
        <p class="mb-6">
            {data.translations.welcome_message}!
        </p>
        <div class="flex gap-4">
            <Button
                label={data.translations.start_practising}
                type="button"
                onclick={() => goto(resolve('/challenges'))}
                Icon={IconArrowRightBold}
                aria-label="Go to challenges" />
            <Button
                label={data.translations.learn}
                type="button"
                onclick={() => goto(resolve('/learn'))}
                Icon={IconGraduationCapBold}
                aria-label="Go to learn page" />
        </div>
    </div>
    <div class="w-full perspective-midrange">
        <Countdown translations={data.translations} targetDate={nextCtf?.start_time} />
    </div>
</main>
