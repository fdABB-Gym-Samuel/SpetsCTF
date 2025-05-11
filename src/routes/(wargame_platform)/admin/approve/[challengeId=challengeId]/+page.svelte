<script lang="ts">
	import { enhance } from '$app/forms';
	import ChallengeForm from '$lib/components/ChallengeForm.svelte';
	let { data, form } = $props();
	let { translations, unapprovedChallenge } = data;
	import { categories } from '$lib/db/constants';
	import { linkPattern } from '$lib/utils/utils.js';

	type resource_type = 'File' | 'Command' | 'Website';

	let mainCategory: string = $state(categories[3]);
	if (unapprovedChallenge?.challenge_category) {
		mainCategory = unapprovedChallenge?.challenge_category;
	}
	let selectedCategories: string[] = $state([]);
	if (unapprovedChallenge !== undefined && unapprovedChallenge.challenge_sub_categories !== null) {
		selectedCategories = categories.filter(
			(_, index) =>
				unapprovedChallenge.challenge_sub_categories.split('').reverse().join('')[index] === '1'
		);
	}

	interface resource {
		resource_type: resource_type;
		resource_content?: string;
		resource_file?: File;
	}

	let current_resource: resource = $state({
		resource_type: 'Website',
		resource_content: ''
	});

	let challenge_resources: Record<'Command' | 'Website', string[]> = $state({
		Command: unapprovedChallenge?.resources
			.filter((res) => (res.type as unknown as 'cmd' | 'web' | 'file') === 'cmd')
			.map((res) => res.content),
		Website: unapprovedChallenge?.resources
			.filter((res) => (res.type as unknown as 'cmd' | 'web' | 'file') === 'web')
			.map((res) => res.content)
	});
	let original_files: string[] = $state(
		unapprovedChallenge?.resources
			.filter((res) => (res.type as unknown as 'cmd' | 'web' | 'file') === 'file')
			.map((res) => res.content)
	);
	// It just doenst want to work wihtout a separate array
	let files: FileList | undefined = $state();

	let new_challenge_form: HTMLFormElement;
</script>

<div class="content">
	<h2 class="text-4xl font-bold">Approve challenge</h2>
	{#if form}
		<span class="text-red-600">{translations.failure}: {form.message}</span>
	{/if}
	<ChallengeForm
		formName="approveChallenge"
		isAuthor={true}
		editing={true}
		challengeData={unapprovedChallenge}
	></ChallengeForm>
</div>
