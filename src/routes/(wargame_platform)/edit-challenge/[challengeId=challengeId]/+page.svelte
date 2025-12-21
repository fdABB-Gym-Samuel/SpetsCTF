<script lang="ts">
	import ChallengeForm from '$lib/components/ChallengeForm.svelte';
	let { data, form } = $props();
	let editableChallenge = $derived(data.editableChallenge)
</script>

<div class="content mb-4">
	<h2 class="text-4xl font-bold">Edit Challenge</h2>
	{#if form && form?.success}
		<span class="text-green-600">{data.translations.success}: {form.message}</span>
	{:else if form && !form?.success}
		<span class="text-red-600">{data.translations.failure}: {form.message}</span>
	{/if}
	<ChallengeForm
		submitText="Edit Challenge"
		formName="editChallengeForm"
		isAuthor={true}
		editing={true}
		challengeData={editableChallenge}
	></ChallengeForm>
</div>
