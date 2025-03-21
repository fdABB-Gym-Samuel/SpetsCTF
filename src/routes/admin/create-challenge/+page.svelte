<script lang="ts">
	let { data, form } = $props();
	let { translations } = data;

	type resource_type = 'File' | 'Command' | 'Website';

	interface resource {
		resource_type: resource_type;
		resource_content?: string;
		resource_file?: File;
	}

	let current_resource: resource = $state({
		resource_type: 'Website',
		resource_content: ''
	});

	let challenge_resources: Record<resource_type, (File | string)[]> = $state({
		File: [],
		Command: [],
		Website: []
	});

	let new_challenge_form: HTMLFormElement;

	let formData_new_challenge: FormData | undefined = $state();

	const add_resource = (e: SubmitEvent) => {
		e.preventDefault();
		if (!(e.currentTarget instanceof HTMLFormElement)) {
			return;
		}
		let formData = new FormData(e.currentTarget);

		const type: resource_type = formData.get('resource_type') as resource_type;
		const type_formdata = `${type.toLocaleLowerCase()}s`;
		const resources: File[] | string[] = formData.getAll(type_formdata) as File[] | string[];
		challenge_resources[type] = [...challenge_resources[type], ...resources];

		formData_new_challenge = new FormData(new_challenge_form);

		if (formData_new_challenge === undefined) return;

		formData_new_challenge.delete(type_formdata);
		if (type !== 'File') {
			challenge_resources[type].forEach((content) => {
				formData_new_challenge.append(type_formdata, content);
			});
		}
		// Had **A LOT** of difficulty putting files into hidden input fields
		// so have to redefine files every time
		formData_new_challenge.delete('files');
		challenge_resources['File'].forEach((file) => {
			formData_new_challenge.append('files', file, file.name);
		});
	};
	const remove_resource = (type: resource_type, index: number) => {
		challenge_resources[type].splice(index, 1);
	};

	const submit_new_challenge = async (e: SubmitEvent) => {
		if (formData_new_challenge === undefined) {
			if (e.currentTarget instanceof HTMLFormElement) {
				formData_new_challenge = new FormData(e.currentTarget);
			}
		}

		const response = await fetch('', {
			method: 'POST',
			body: formData_new_challenge
		});
		return response;
	};
</script>

<!-- <div class="mx-auto flex w-1/2 flex-col space-y-2"> -->
<div class="content">
	{#if form && form?.success}
		<span class="text-green-600">{translations.success}</span>
	{:else if form && !form?.success}
		<span class="text-red-600">{translations.failure}</span>
	{/if}
	<h2 class="text-4xl font-bold">{translations.addnewchallenge}</h2>
	<form
		method="POST"
		onsubmit={(e: SubmitEvent) => {
			submit_new_challenge(e);
		}}
		class="flex flex-col"
		id="new_challenge_form"
		enctype="multipart/form-data"
		bind:this={new_challenge_form}
	>
		<div class="mb-5 flex flex-col">
			<label for="challenge_id">{translations.challenge_id}</label>
			<input
				class="border border-black"
				type="text"
				name="challenge_id"
				id="challenge_id"
				required
				placeholder="Enter the ID."
			/>
		</div>
		<div class="mb-5 flex flex-col">
			<label for="display_name">{translations.challenge_display_name}</label>
			<input
				class="border border-black"
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
				class="border border-black"
				placeholder="Write a description for your challenge"
			></textarea>
		</div>
		<div class="mb-5 flex flex-col">
			<label for="flag">{translations.flag}</label>
			<input
				class="border border-black"
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
				class="border border-black"
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
				class="border border-black"
				placeholder="Enter the base amount of points."
			/>
		</div>
		<div class="mb-5 flex flex-col">
			<label for="challenge_category">{translations.challenge_category}</label>
			<select
				id="challenge_category"
				name="challenge_category"
				class="border border-black"
				value="misc"
			>
				{#each ['blockchain', 'crypto', 'forensics', 'introduction', 'misc', 'osint', 'pwn', 'reversing', 'web'] as option}
					<option value={option} class="text-background-dark">{option}</option>
				{/each}
			</select>
		</div>
	</form>

	<h5 class="text-xl">Add Resource</h5>
	<form
		onsubmit={(e: SubmitEvent) => {
			add_resource(e);
		}}
		class="border-foreground-dark mb-5 flex flex-col border-1 px-5 py-2"
	>
		<label for="resource_type">Resource type</label>
		<select
			name="resource_type"
			bind:value={current_resource.resource_type}
			class="border border-black"
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
				class="border-accent-dark border pl-1"
				bind:value={current_resource.resource_content}
				placeholder={`My ${current_resource.resource_type}`}
			/>
		{:else}
			<label for="file_">File</label>
			<input
				type="file"
				name="files"
				multiple
				class="border-accent-dark border"
				bind:value={current_resource.resource_file}
			/>
		{/if}
		<!-- {#if current_resource.resource_type === "File"} -->
		<button
			type="submit"
			class="ignore-default bg-button-dark border-foreground-dark w-fit rounded-md border-2 px-1.5 py-0.5"
			>Add Resource
		</button>
	</form>

	{#each Object.entries(challenge_resources) as [type, resource_list]: [resource_type, resource[]]}
		<h5 class="text-xl">{type}s</h5>
		<ul>
			{#each resource_list as resource, i}
				{#if type !== 'File'}
					<li class="flex flex-row gap-2">
						<p>{resource}</p>
						<button
							type="button"
							class="ignore-default bg-button-dark border-foreground-dark h-fit rounded-sm border-1 px-1.5"
							onclick={() => {
								remove_resource(type, i);
							}}>X</button
						>
						{#if resource.resource_type === 'Command'}
							<input name="commands" type="hidden" form="new_challenge_form" value={resource} />
						{:else}
							<input name="websites" type="hidden" form="new_challenge_form" value={resource} />
						{/if}
					</li>
				{:else}
					<li class="flex flex-row">
						<p>{resource.name}</p>
						<button
							type="button"
							class="ignore-default bg-button-dark border-foreground-dark rounded-sm border-1 px-1.5"
							onclick={() => {
								remove_resource(type, i);
							}}>X</button
						>
						<!-- <input name="files" type="file" form="new_challenge_form" hidden bind:files={challenge_resources.File} > -->
					</li>
				{/if}
			{/each}
			<!-- <input name="files" type="file" bind:value={file}> -->
		</ul>
	{/each}

	<button type="submit" form="new_challenge_form">Submit</button>
	<!-- </form> -->
</div>
