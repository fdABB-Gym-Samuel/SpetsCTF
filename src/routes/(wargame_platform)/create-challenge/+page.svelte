<script lang="ts">
	import { enhance } from '$app/forms';
	let { data, form } = $props();
	let { translations } = data;

	type resource_type = 'File' | 'Command' | 'Website';

	let categories = [
		'crypto',
		'forensics',
		'introduction',
		'misc',
		'osint',
		'pwn',
		'reversing',
		'web'
	];

	let mainCategory: string = $state(categories[3]);

	let selectedCategories = $state([]);

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
		Command: [],
		Website: []
	});
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
	<form
		method="POST"
		class="flex flex-col"
		id="new_challenge_form"
		enctype="multipart/form-data"
		bind:this={new_challenge_form}
		use:enhance
	>
		<div class="mb-5 flex flex-col">
			<label for="display_name">{translations.challenge_display_name}</label>
			<input
				class="border-accent-light dark:border-accent-dark border pl-2"
				type="text"
				name="display_name"
				id="display_name"
				placeholder="Enter a FIRE 🔥 name."
			/>
		</div>
		<div class="mb-5 flex flex-col">
			<label for="description">Challenge description</label>
			<textarea
				name="description"
				id="challenge-description"
				class="border-accent-light dark:border-accent-dark border pl-2"
				placeholder="Write a description for your challenge"
			></textarea>
		</div>
		<div class="mb-5 flex flex-col">
			<label for="flag">{translations.flag}</label>
			<input
				class="border-accent-light dark:border-accent-dark border pl-2"
				type="text"
				name="flag"
				required
				id="flag"
				placeholder="Enter the secret flag 🚩..."
			/>
		</div>
		<div class="mb-5 flex flex-col">
			<label for="flag_format">{translations.flag_format}</label>
			<input
				class="border-accent-light dark:border-accent-dark border pl-2"
				type="text"
				name="flag_format"
				id="flag_format"
				placeholder="e.g. myctf&#123;...&#125;"
			/>
		</div>
		<div class="mb-5 flex flex-col">
			<label for="points">{translations.points}</label>
			<input
				type="number"
				required
				id="points"
				name="points"
				class="border-accent-light dark:border-accent-dark border pl-2"
				placeholder="Enter the base amount of points."
			/>
		</div>
		<div class="mb-5 flex flex-col">
			<label for="challenge_category">{translations.main} {translations.challenge_category}</label>
			<select
				id="challenge_category"
				name="challenge_category"
				class="border-accent-light dark:border-accent-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark border pl-2"
				bind:value={mainCategory}
			>
				{#each categories as categoryOption}
					<option value={categoryOption} class="text-background-dark">{categoryOption}</option>
				{/each}
			</select>
		</div>
		<div class="mb-5">
			<fieldset>
				<legend>Categories</legend>
				<ul class="divide-accent-dark grid grid-cols-3 gap-x-4 divide-x px-4">
					{#each categories.filter((category_) => category_ !== mainCategory) as category}
						<div class="flex w-full flex-row justify-between px-2">
							<label for={`sub_category_${category}`}>
								{category}
							</label>
							<input
								name="sub_categories"
								type="checkbox"
								id={`sub_category_${category}`}
								bind:group={selectedCategories}
								value={category}
							/>
						</div>
					{/each}
				</ul>
			</fieldset>
		</div>
		<div class="mb-5">
			<label for="stay_anonymous">Stay Anonymous:</label>
			<input type="checkbox" name="stay_anonymous" id="stay_anonymous" value="1" checked />
		</div>
	</form>

	<h5 class="text-xl">Add Resource</h5>
	<form
		onsubmit={(e: SubmitEvent) => {
			add_resource(e);
		}}
		class="bprder-foreground-light dark:border-foreground-dark mb-5 flex flex-col border-1 px-5 py-2"
	>
		<label for="resource_type">Resource type</label>
		<select
			name="resource_type"
			bind:value={current_resource.resource_type}
			class="border-accent-light dark:border-accent-dark dark:bg-background-dark bg-background-light text-foreground-light dark:text-foreground-dark border pl-2"
		>
			<option class="text-background-dark" value="Command">Command</option>
			<option class="text-background-dark" value="Website">Website</option>
			<option class="text-background-dark" value="File">File</option>
		</select>
		{#if current_resource.resource_type !== 'File'}
			<label for="resource_content">Content</label>
			<input
				type="text"
				name={`${current_resource.resource_type.toLocaleLowerCase()}s`}
				class="border-accent-light dark:border-accent-dark border pl-2"
				bind:value={current_resource.resource_content}
				placeholder={`My ${current_resource.resource_type}`}
			/>
		{:else}
			<label for="file_">File</label>
			<input
				type="file"
				name="files"
				multiple
				class="border-accent-light dark:border-accent-dark border pl-2"
				bind:value={current_resource.resource_file}
			/>
		{/if}
		<button
			type="submit"
			class="ignore-default bg-button-light dark:bg-button-dark border-foreground-light dark:border-foreground-dark mt-3 w-fit rounded-md border-2 px-1.5 py-0.5"
			>Add Resource
		</button>
	</form>

	<h5 class="border-accent-light dark:border-accent-dark mb-2 border-b-2 text-xl">Files</h5>
	<ul>
		{#each files !== undefined ? files : [] as file, i}
			<li class="flex flex-row gap-2">
				<p>{file instanceof File ? file.name : file}</p>
				<button
					type="button"
					class="ignore-default bg-button-light dark:bg-button-dark border-foreground-light dark:border-foreground-dark h-fit rounded-sm border-1 px-1.5"
					onclick={() => {
						remove_resource('File', i);
					}}>X</button
				>
			</li>
		{/each}
		{#if files && files?.length > 0}
			<input type="file" name="files" form="new_challenge_form" bind:files hidden />
		{/if}
	</ul>
	{#each Object.entries(challenge_resources) as [type, resource_list]: ["Website"|"Command", resource[]]}
		{#if ['Command', 'Website', 'File'].includes(type)}
			<h5 class="border-accent-light dark:border-accent-dark mb-2 border-b-2 text-xl">{type}s</h5>
			<ul class="flex flex-col gap-1">
				{#each resource_list as resource, i}
					<li class="flex flex-row gap-2">
						<p>{resource}</p>
						<button
							type="button"
							class="ignore-default bg-button-light dark:bg-button-dark border-foreground-light dark:border-foreground-dark h-fit rounded-sm border-1 px-1.5"
							onclick={() => {
								if (type === 'Website' || type === 'Command') remove_resource(type, i);
							}}>X</button
						>
						{#if type === 'Command'}
							<input name="commands" type="hidden" form="new_challenge_form" value={resource} />
						{:else if type === 'Website'}
							<input name="websites" type="hidden" form="new_challenge_form" value={resource} />
						{/if}
					</li>
				{/each}
			</ul>
		{/if}
	{/each}

	<button type="submit" form="new_challenge_form" class="mt-5">Submit</button>
</div>
