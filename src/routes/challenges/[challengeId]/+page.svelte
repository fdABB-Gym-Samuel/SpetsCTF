<script lang="ts">
    import ChallengeDialog from '$lib/components/ChallengeDialog.svelte';

    let { data, form } = $props();

    let challengeData = $derived(data.challengeData);
    let firstSolvers = $derived(data.firstSolvers);
    let resources = $derived(data.resources);
    let translations = $derived(data.translations);
    let numSolvers = $derived(data.numSolvers);
    let user = $derived(data.user);

    let challengeDataJoined = $derived({
        ...challengeData,
        first_solvers: firstSolvers,
        num_solvers: numSolvers,
        resources: resources,
    });

    import { resolve } from '$app/paths';
    import { goto } from '$app/navigation';

    function closeDialog() {
        goto(resolve('/challenges'), { invalidate: ['data:challenges'] });
    }
</script>

<ChallengeDialog
    {closeDialog}
    challengeData={challengeDataJoined}
    {translations}
    {user}
    {form}></ChallengeDialog>
