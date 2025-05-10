<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Select from '$lib/components/input/Select.svelte';
	import Input from '$lib/components/input/Input.svelte';

	import { linkPattern } from '$lib/utils/utils.js';
	import { Trash2 } from '@lucide/svelte';

	let { form } = $props();

	type resource_type = 'file' | 'command' | 'website';

	interface resource {
		resource_type: resource_type;
		resource_content?: string;
		resource_file?: File;
	}

	const resourceTypeOptions = [
		{ text: 'Website', value: 'website' },
		{ text: 'Command', value: 'command' },
		{ text: 'File', value: 'file' }
	];

	let currentResourceType: 'website' | 'command' | 'file' = $state('website');
	let currentResourceContent: string = $state('');
	let currentResourceFile: File | undefined = $state();

	let challenge_resources: Record<'command' | 'website', string[]> = $state({
		command: [],
		website: []
	});
	// It just doenst want to work wihtout a separate array
	let files: FileList | undefined = $state();

	const add_resource = (e: SubmitEvent) => {
		e.preventDefault();
		if (!(e.currentTarget instanceof HTMLFormElement)) {
			return;
		}
		let formData = new FormData(e.currentTarget);

		const type: resource_type = formData.get('resourceType') as resource_type;
		const type_formdata = `${type.toLocaleLowerCase()}s`;

		let resources: File[] | string[];
		if (type !== 'file') {
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
		console.log(challenge_resources);
	};
	const remove_resource = (type: resource_type, index: number) => {
		if (type !== 'file') challenge_resources[type].splice(index, 1);
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

<h5 class="text-xl">Add Resource</h5>
<form
	onsubmit={(e: SubmitEvent) => {
		add_resource(e);
	}}
	class="bprder-foreground-light dark:border-foreground-dark mb-5 flex flex-col gap-1 border-1 px-5 py-2"
>
	<div>
		<Select
			label="Resource Type"
			name="resourceType"
			bind:value={currentResourceType}
			options={resourceTypeOptions}
			id="ResourceTypeSelect"
		></Select>
	</div>
	{#if currentResourceType === 'website'}
		<Input
			label="Website"
			type="text"
			name="websites"
			placeholder="eg. https://google.com"
			bind:value={currentResourceContent}
			pattern={linkPattern.source}
		></Input>
	{:else if currentResourceType === 'command'}
		<Input
			label="Command"
			type="text"
			name="commands"
			placeholder="eg. sudo rm -rf / --no-preserce-root"
			bind:value={currentResourceContent}
		></Input>
	{:else}
		<Input
			label="File"
			type="file"
			name="files"
			multiple={true}
			placeholder="eg. myfile.txt"
			bind:value={currentResourceFile}
		></Input>
	{/if}
	<div class="mt-4">
		<Button type="submit" label="Add Resource" ariaLabel="Add resource" styleType="small"></Button>
	</div>
</form>

<h5 class="border-bg-600 mb-2 border-b-2 text-lg">Files</h5>
<ul class="flex flex-col gap-2">
	{#each files !== undefined ? files : [] as file, i}
		<li class="flex flex-row justify-center gap-2">
			<p>{file instanceof File ? file.name : file}</p>

			<Button
				label=""
				Icon={Trash2}
				type="button"
				ariaLabel="Remove File"
				styleType="icon"
				onClick={() => {
					remove_resource('file', i);
				}}
				bgColor="bg-red-700"
			></Button>
		</li>
	{/each}

	<div>
		{#if files && files?.length > 0}
			<input type="file" name="files" {form} bind:files hidden />
		{/if}
	</div>
</ul>
{#each Object.entries(challenge_resources) as [type, resource_list]: ["website"|"command", resource[]]}
	{#if ['command', 'website', 'file'].includes(type)}
		<h5 class="border-bg-600 mb-2 border-b-2 text-lg">{type}s</h5>
		<ul class="flex flex-col gap-2">
			{#each resource_list as resource, i}
				<li class="flex flex-row items-center gap-2">
					<p>{resource}</p>
					<Button
						type="button"
						label=""
						styleType="icon"
						Icon={Trash2}
						ariaLabel={`Remove ${type}`}
						onClick={() => {
							if (type === 'website' || type === 'command') remove_resource(type, i);
						}}
						bgColor="bg-red-700"
					></Button>
					<div>
						{#if type === 'Command'}
							<input name="commands" type="hidden" {form} value={resource} />
						{:else if type === 'Website'}
							<input name="websites" type="hidden" {form} value={resource} />
						{/if}
					</div>
				</li>
			{/each}
		</ul>
	{/if}
{/each}
