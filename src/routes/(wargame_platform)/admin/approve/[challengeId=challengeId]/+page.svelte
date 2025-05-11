<script lang="ts">
	import ChallengeForm from '$lib/components/ChallengeForm.svelte';
	let { data, form } = $props();
	let { translations, unapprovedChallenge } = data;

	const isAuthor = unapprovedChallenge.author_id === data.user?.id;
</script>

<div class="content">
	<h2 class="text-4xl font-bold">Approve challenge</h2>
	{#if form}
		<span class="text-red-600">{translations.failure}: {form.message}</span>
	{/if}
	<ChallengeForm
		formName="approveChallenge"
		{isAuthor}
		editing={true}
		challengeData={unapprovedChallenge}
	></ChallengeForm>
</div>
