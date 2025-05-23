<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import Button from '$lib/components/Button.svelte';
	import Input from '$lib/components/input/Input.svelte';
	import { Trash2 } from '@lucide/svelte';
	let { data, form } = $props();
	let { translations } = data;

	interface user {
		id: string;
		display_name: string;
		github_username: string;
	}

	let userSearch = $state('');
	let searchFocused = $state(false);
	let matchingUsers: user[] = $state([]);
	let searchTimeout: null | NodeJS.Timeout | number = null;

	let organizersToAdd: user[] = $state([]);

	const ctfId = page.params.ctf_id;

	$effect(() => {
		const curr = userSearch;

		if (searchTimeout !== null) {
			clearTimeout(searchTimeout);
		}
		searchTimeout = setTimeout(() => {
			searchUser(curr);
		}, 200);
	});

	const searchUser = async (github_username: string) => {
		const response = await fetch(`/api/search/users?q=${github_username}&ctf=${ctfId}`);
		matchingUsers = ((await response.json()) as user[]).filter(
			(user) => organizersToAdd.filter((org) => org.id === user.id).length < 1
		);
	};

	const removeNewOrg = (id: string) => {
		organizersToAdd = organizersToAdd.filter((org) => org.id !== id);
	};

	interface adminLink {
		display: string;
		href: string;
	}

	const adminLinks: adminLink[] = [
		{ href: 'organizer/create-challenge', display: translations.createchallenge },
		{ href: 'organizer/approve', display: translations.approve }
	];

	let dropdownData = $derived({
		id: 'matchingUsers',
		results: matchingUsers,
		primary_name: 'display_name',
		secondary_name: 'github_username',
		onSelect: (newOrg: user) => {
			if (organizersToAdd.filter((org) => org.id === newOrg.id).length > 0) return;

			organizersToAdd.push(newOrg);
			searchUser(userSearch);
		},
		currentSelected: 0
	});

	$effect(() => {
		if (form?.success) {
			organizersToAdd = [];
		}
	});
</script>

<div class="content">
	<h1 class="route-title">{translations.cuttingedgeadmintools}</h1>
	<ul>
		{#each adminLinks as adminLink}
			<li>
				<a class="text-accent-dark underline" href={adminLink.href}>
					{adminLink.display}
				</a>
			</li>
		{/each}
	</ul>

	<h3 class="text-2xl">Add new organizer</h3>
	{#if form}
		<div>
			<p class:text-green-500={form.success} class:text-red-500={!form.success}>{form.message}</p>
		</div>
	{/if}
	<div class="mb-2 flex flex-col">
		<Input
			label="User"
			type="search"
			name="newOrg"
			placeholder="eritho23"
			bind:value={userSearch}
			bind:inputFocused={searchFocused}
			{dropdownData}
		></Input>
	</div>
	<form action="?/addOrg" method="POST" use:enhance>
		<ul class="mb-4 flex max-h-50 w-full flex-col items-center overflow-y-scroll px-4">
			{#each organizersToAdd.slice().reverse() as newOrg, i}
				<li
					class="flex w-full items-center justify-between gap-1 border-y-1 px-4 py-1.5"
					class:bg-bg-600={i % 2 == 1}
				>
					<input type="hidden" value={newOrg.id} name="newOrg" />
					<div
						class="flex max-w-[calc(100%-2.5em)] min-w-5 gap-1 overflow-x-hidden text-nowrap text-ellipsis"
					>
						<span class=" mr-1 min-w-5 overflow-x-hidden text-ellipsis">{newOrg.display_name}</span>
						(<span class="min-w-5 overflow-x-hidden text-ellipsis">{newOrg.github_username}</span>)
					</div>
					<Button
						Icon={Trash2}
						type="button"
						styleType="icon"
						bgColor="bg-red-700"
						onClick={() => removeNewOrg(newOrg.id)}
						label=""
						ariaLabel="Remove organizer"
					></Button>
				</li>
			{/each}
		</ul>
		<Button
			label="Add orgs"
			type="submit"
			styleType="normal"
			ariaLabel="Add orgs"
			disabled={searchFocused}
		></Button>
	</form>
</div>
