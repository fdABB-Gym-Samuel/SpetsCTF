<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Input from '$lib/components/Input.svelte';
	import { Trash2 } from '@lucide/svelte';
	let { data } = $props();
	let { translations } = data;

	interface user {
		id: string;
		display_name: string;
		github_username: string;
	}

	let userSearch = $state('');
	let matchingUsers: user[] = $state([]);
	let searchTimeout: null | NodeJS.Timeout | number = null;

	let organizersToAdd: user[] = $state([]);

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
		const response = await fetch(`/api/search/users?q=${github_username}`);
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
	<form action="?/add-org" method="POST">
		<div class="mb-2 flex flex-col">
			<Input
				label="User"
				type="search"
				name="newOrg"
				placeholder="eritho23"
				bind:value={userSearch}
				{dropdownData}
			></Input>
			<!-- <label for="orgName">Github Username</label>
			<input list="usersList" bind:value={userSearch} />
			<datalist id="usersList">
				{#each matchingUsers as user}
					<option value={user.id}>{user.display_name} ({user.github_username})</option>
				{/each}
			</datalist> -->
		</div>
		<ul class="mb-4 flex max-h-50 w-full flex-col items-center overflow-y-scroll px-4">
			{#each organizersToAdd.slice().reverse() as newOrg, i}
				<li
					class="flex w-full justify-between gap-1 border-y-1 px-4 py-1.5 align-text-top"
					class:bg-bg-600={i % 2 == 1}
				>
					<input type="hidden" value={newOrg.id} name="newOrg" />
					{newOrg.display_name} ({newOrg.github_username})
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
		<Button label="Add orgs" type="submit" styleType="normal" ariaLabel="Add orgs"></Button>
	</form>
</div>
