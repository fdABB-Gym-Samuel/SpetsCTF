<script lang="ts">
	import Input from '$lib/components/input/Input.svelte';
	import Button from '$lib/components/Button.svelte';
	import Select from '$lib/components/input/Select.svelte';
	import ResourceUpload from '$lib/components/ResourceUpload.svelte';

	import { categories } from '$lib/db/constants';
	import Checkbox from '$lib/components/input/Checkbox.svelte';
	let { formName, action = '', isAuthor, editing } = $props();

	let displayName = $state('');
	let description = $state('');
	let flag = $state('');
	let flagFormat = $state('');
	let points = $state('');

	let mainCategory = $state('misc');
	let categoryOptions = categories.map((category) => ({
		value: category,
		text: category.charAt(0).toUpperCase() + category.slice(1)
	}));
	let possibleSubCategories = $derived.by(() =>
		categoryOptions.filter((category) => category.value !== mainCategory)
	);
	let selectedSubCategories = $state([]);

	let privacyOptions = $state([{ text: 'Author Anonymous', value: 'author_anonymous' }]);
	let privacySelected = $state(['author_anonymous']);
</script>

<form {action} method="POST" id={formName} class="flex flex-row flex-wrap justify-around gap-x-10">
	<section class="flex max-w-200 min-w-80 flex-grow flex-col gap-4">
		<Input
			label="Challenge display name"
			bind:value={displayName}
			type="text"
			placeholder="Enter a FIRE 🔥 name."
			name="display_name"
		></Input>
		<Input
			label="Challenge description"
			bind:value={description}
			type="text"
			placeholder="Write a description for your challenge"
			name="description"
		></Input>
		<Input
			label="Flag"
			bind:value={flag}
			type="text"
			placeholder="Enter a secret flag 🚩"
			name="flag"
		></Input>
		<Input
			label="Flag Format"
			bind:value={flagFormat}
			type="text"
			placeholder="SPETSCTF&#123...&#125"
			name="flag_format"
		></Input>

		<Checkbox
			title="Privacy"
			name={'privacy'}
			options={privacyOptions}
			bind:selected={privacySelected}
		></Checkbox>
	</section>
	<section class="flex max-w-200 min-w-80 flex-grow flex-col gap-4">
		<Input
			label="Points"
			bind:value={points}
			type="number"
			placeholder="Enter the points one will recieve for solving your challenge"
			name="flag_format"
		></Input>
		<Select
			label="Main Category"
			bind:value={mainCategory}
			name="challenge_category"
			id="categorySelection"
			options={categoryOptions}
		></Select>
		<Checkbox
			title="Sub Categories"
			name="sub_categories"
			options={possibleSubCategories}
			bind:selected={selectedSubCategories}
		></Checkbox>
	</section>
</form>
<section>
	<ResourceUpload form={formName}></ResourceUpload>
</section>
