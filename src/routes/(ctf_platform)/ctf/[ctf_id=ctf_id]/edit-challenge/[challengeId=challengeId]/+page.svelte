<script lang="ts">
	import { enhance } from '$app/forms';
	import ChallengeForm from '$lib/components/ChallengeForm.svelte';
	let { data, form } = $props();
	let { translations, editableChallenge } = data;
	import { categories } from '$lib/db/constants';
	import { linkPattern } from '$lib/utils/utils.js';

	type resource_type = 'File' | 'Command' | 'Website';

	let mainCategory: string = $state(categories[3]);
	if (editableChallenge?.challenge_category) {
		mainCategory = editableChallenge.challenge_category;
	}
	let selectedCategories: string[] = $state([]);
	if (editableChallenge !== undefined && editableChallenge.challenge_sub_categories !== null) {
		selectedCategories = categories.filter(
			(_, index) =>
				editableChallenge.challenge_sub_categories.split('').reverse().join('')[index] === '1'
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
		Command: editableChallenge?.resources
			.filter((res) => (res.type as unknown as 'cmd' | 'web' | 'file') === 'cmd')
			.map((res) => res.content),
		Website: editableChallenge?.resources
			.filter((res) => (res.type as unknown as 'cmd' | 'web' | 'file') === 'web')
			.map((res) => res.content)
	});
	let original_files: string[] = $state(
		editableChallenge?.resources
			.filter((res) => (res.type as unknown as 'cmd' | 'web' | 'file') === 'file')
			.map((res) => res.content)
	);
	// It just doenst want to work wihtout a separate array
	let files: FileList | undefined = $state();

	let new_challenge_form: HTMLFormElement;

	const add_resource = (e: SubmitEvent) => {
		e.preventDefault();
		if (!(e.currentTarget instanceof HTMLFormElement)) {
			return;
		}
		let formData = new FormData(e.currentTarget);

		const type: resource_type = formData.get('resource_type') as resource_type;
		const type_formdata = `${type.toLocaleLowerCase()}s`;
		let resources: File[] | string[];
		if (type !== 'File') {
			resources = formData.getAll(type_formdata) as string[];
			challenge_resources[type] = [...challenge_resources[type], ...resources];
		} else {
			resources = formData.getAll(type_formdata) as File[];
			if (files !== undefined) {
				resources = [...files, ...resources];
			} else {
				resources = resources;
			}
			if (resources === undefined) return 'Fuck';

			let dt = new DataTransfer();
			resources.forEach((file) => {
				if (file instanceof File) {
					dt.items.add(file);
				}
			});
			files = dt.files;
		}
	};
	const remove_resource = (type: resource_type, index: number) => {
		if (type !== 'File') challenge_resources[type].splice(index, 1);
		// Files are a little more complicated, needing a DataTransfer (actually the FileList in it),
		// this is because i want to insert a "hidden" input element conatining all the files
		// in order to not have to send my own formdata directly to the sveltekit action, which interferes
		// with small parts of the form implementation (status at the top, which is done through form prop)
		else {
			if (files !== undefined) {
				let new_files = Array.from(files).filter((file, i) => i !== index);
				let dt = new DataTransfer();
				new_files.forEach((file) => {
					dt.items.add(file);
				});
				files = dt.files;
			}
		}
	};
</script>

<div class="content">
	<h2 class="text-4xl font-bold">{translations.addnewchallenge}</h2>
	{#if form && form?.success}
		<span class="text-green-600">{translations.success}: {form.message}</span>
	{:else if form && !form?.success}
		<span class="text-red-600">{translations.failure}: {form.message}</span>
	{/if}
	<ChallengeForm
		formName="editChallengeForm"
		isAuthor={true}
		editing={true}
		challengeData={editableChallenge}
	></ChallengeForm>
</div>
