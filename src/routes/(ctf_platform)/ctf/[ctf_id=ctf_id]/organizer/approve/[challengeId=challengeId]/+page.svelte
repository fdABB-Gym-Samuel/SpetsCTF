<script lang="ts">
	import ChallengeForm from '$lib/components/ChallengeForm.svelte';
	let { data, form } = $props();
	let { translations, unapprovedChallenge } = data;
</script>

<div class="content">
	<h2 class="text-4xl font-bold">{translations.addnewchallenge}</h2>
	{#if form}
		<span class="text-red-600">{translations.failure}: {form.message}</span>
	{/if}
	<ChallengeForm
		formName="approveChallengeForm"
		isAuthor={true}
		editing={true}
		challengeData={unapprovedChallenge}
	></ChallengeForm>
</div>
