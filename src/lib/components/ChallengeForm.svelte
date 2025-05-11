<script lang="ts">
	import Input from '$lib/components/input/Input.svelte';
	import Button from '$lib/components/Button.svelte';
	import Select from '$lib/components/input/Select.svelte';
	import ResourceUpload from '$lib/components/ResourceUpload.svelte';
	import Checkbox from '$lib/components/input/Checkbox.svelte';

	import { categories } from '$lib/db/constants';
	import { enhance } from '$app/forms';
	let {
		formName,
		action = '',
		isAuthor,
		editing,
		challengeData = {
			challenge_id: '',
			challenge_name: '',
			challenge_description: '',
			challenge_category: 'misc',
			challenge_sub_categories: '00000000',
			points: undefined,
			flag_format: '',
			flag: '',
			author: undefined,
			author_id: undefined,
			resources: []
		}
	} = $props();

	let displayName = $state(challengeData.challenge_name);
	let description = $state(challengeData.description);
	let flag = $state(challengeData.flag);
	let flagFormat = $state(challengeData.flag_format);
	let points = $state(challengeData.points);

	let mainCategory = $state(challengeData.challenge_category);
	let categoryOptions = categories.map((category) => ({
		value: category,
		text: category.charAt(0).toUpperCase() + category.slice(1)
	}));
	let possibleSubCategories = $derived.by(() =>
		categoryOptions.filter((category) => category.value !== mainCategory)
	);
	let selectedSubCategories: string[] = $state([]);
	selectedSubCategories = categories.filter(
		(_, index) => challengeData.challenge_sub_categories.split('').reverse().join('')[index] === '1'
	);

	let privacyOptions = $state([{ text: 'Author Anonymous', value: 'author_anonymous' }]);
	let privacySelected = $state(['author_anonymous']);

	let submitButtonDisabled = $derived(!displayName || !flag || !points || !mainCategory);

	let resources = challengeData.resources;
</script>

<p class="text-sm"><span class="text-primary-light">*</span>: Required</p>
<form
	{action}
	method="POST"
	id={formName}
	enctype="multipart/form-data"
	class="flex flex-row flex-wrap justify-around gap-x-10 gap-y-4"
	use:enhance
>
	<section class="flex max-w-200 min-w-80 flex-grow flex-col gap-4">
		<Input
			label="Challenge display name"
			bind:value={displayName}
			type="text"
			placeholder="Enter a FIRE 🔥 name."
			name="display_name"
			required={true}
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
			required={true}
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
			name="points"
			required={true}
		></Input>
		<Select
			label="Main Category"
			bind:value={mainCategory}
			name="challenge_category"
			id="categorySelection"
			options={categoryOptions}
			required={true}
		></Select>
		<Checkbox
			title="Sub Categories"
			name="sub_categories"
			options={possibleSubCategories}
			bind:selected={selectedSubCategories}
		></Checkbox>
	</section>
</form>
<section class="mb-4">
	<ResourceUpload form={formName} resourceData={resources}></ResourceUpload>
</section>

<Button
	label="Add Challenge"
	type="submit"
	ariaLabel="Add challenge"
	disabled={submitButtonDisabled}
	form={formName}
></Button>
