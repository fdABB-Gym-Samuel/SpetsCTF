<script lang="ts">
    let { data } = $props();
    let ctfData = $derived(data.ctfData);

    import { page } from '$app/state';
    import Countdown from '$lib/components/Countdown.svelte';

    import IconSwordBold from 'phosphor-icons-svelte/IconSwordBold.svelte';

    import { goto } from '$app/navigation';

    import Button from '$lib/components/Button.svelte';
    import { resolve } from '$app/paths';
    // import type { H } from 'vitest/dist/chunks/environment.d8YfPkTm.js';
</script>

<main class="m-auto flex max-w-[520px] flex-col pt-48">
    <div class="mb-16">
        <h1 class="text-[22px] font-semibold">
            {ctfData?.display_name}
        </h1>
        <div class="mt-3 text-center">
            <Button
                label="See challenges"
                type="button"
                onclick={() =>
                    goto(
                        resolve(`/(ctf_platform)/ctf/[ctfId=ctfId]/challenges`, {
                            ctfId: page.params.ctfId ?? '',
                        })
                    )}
                Icon={IconSwordBold}
                aria-label="Go to challenges" />
        </div>
    </div>
    <div class="w-full perspective-midrange">
        <Countdown targetDate={ctfData?.start_time} />
    </div>
</main>
