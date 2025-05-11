<script lang="ts">
	let { data, form } = $props();
	let { translations } = data;
	import { categories } from '$lib/db/constants';
	// import { linkPattern } from '$lib/utils/utils.js';
	import ChallengeForm from '$lib/components/ChallengeForm.svelte';
	// import ResourceUpload from '$lib/components/ResourceUpload.svelte';

	let mainCategory: string = $state(categories[3]);

	let selectedCategories = $state([]);

	let challenge_resources: Record<'Command' | 'Website', string[]> = $state({
		Command: [],
		Website: []
	});
	// It just doesn't want to work wihtout a separate array
	let files: FileList | undefined = $state();

	let new_challenge_form: HTMLFormElement;

	let formName = 'newChallengeForm';
</script>

<div class="content mb-4">
	<h2 class="text-4xl font-bold">{translations.addnewchallenge}</h2>
	{#if form && form?.success}
		<span class="text-green-600">{translations.success}: {form.message}</span>
	{:else if form && !form?.success}
		<span class="text-red-600">{translations.failure}: {form.message}</span>
	{/if}

	<ChallengeForm {formName} isAuthor={true} editing={false}></ChallengeForm>
</div>
