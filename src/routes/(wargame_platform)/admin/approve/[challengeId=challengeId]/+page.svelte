<script lang="ts">
    import ChallengeForm from '$lib/components/ChallengeForm.svelte';
    let { data, form } = $props();
    let translations = $derived(data.translations);
    let unapprovedChallenge = $derived(data.unapprovedChallenge);

    const isAuthor = $derived(unapprovedChallenge.author_id === data.user?.id);
</script>

<div class="content mb-4">
    <h2 class="text-4xl font-bold">Approve Challenge</h2>
    {#if form}
        <span class="text-red-600">{translations.failure}: {form.message}</span>
    {/if}
    <ChallengeForm
        submitText="Approve Challenge"
        formName="approveChallenge"
        {isAuthor}
        editing={true}
        challengeData={unapprovedChallenge}></ChallengeForm>
</div>
