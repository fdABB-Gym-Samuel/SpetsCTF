<script lang="ts">
    import ChallengeDialog from '$lib/components/ChallengeDialog.svelte';

    let { data } = $props();

    let challengeData = $derived(data.challengeData);
    let firstSolvers = $derived(data.firstSolvers);
    let resources = $derived(data.resources);
    let translations = $derived(data.translations);
    let numSolvers = $derived(data.numSolvers);

    let challengeDataJoined = $derived({
        ...challengeData,
        first_solvers: firstSolvers,
        num_solvers: numSolvers.count ?? 0,
        resources: resources,
    });

    import { page } from '$app/state';
    import { resolve } from '$app/paths';
    import { goto } from '$app/navigation';
    function closeDialog() {
        goto(
            resolve('/(ctf_platform)/ctf/[ctfId=ctfId]/challenges', {
                ctfId: page.params.ctfId ?? '',
            }),
            { invalidate: ['data:challenges'] }
        );
    }
</script>

<ChallengeDialog {closeDialog} challengeData={challengeDataJoined} {translations}
></ChallengeDialog>
