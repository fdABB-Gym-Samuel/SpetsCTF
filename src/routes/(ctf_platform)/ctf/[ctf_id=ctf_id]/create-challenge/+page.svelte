<script lang="ts">
	import ChallengeForm from '$lib/components/ChallengeForm.svelte';
	let { data, form } = $props();
	let { translations } = data;
</script>

<div class="content mb-4">
	<h2 class="text-4xl font-bold">Create New Challenge</h2>
	{#if form && form?.success}
		<span class="text-green-600">{translations.success}: {form.message}</span>
	{:else if form && !form?.success}
		<span class="text-red-600">{translations.failure}: {form.message}</span>
	{/if}
	<ChallengeForm
		submitText="Create Challenge"
		formName="newChallengeForm"
		isAuthor={true}
		editing={false}
	></ChallengeForm>
</div>
