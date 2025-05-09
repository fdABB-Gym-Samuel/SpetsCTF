<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Input from '$lib/components/Input.svelte';
	let { data } = $props();
	let { translations } = data;

	let userSearch = $state('');
	let matchingUsers = $state([]);
	let searchTimeout: null | NodeJS.Timeout | number = null;

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
		matchingUsers = await response.json();
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
		onSelect: (id: string) => {
			console.log(matchingUsers.find((user) => user.id === id));
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
	<form action="?/add-org">
		<div class="mb-2 flex flex-col">
			<Input
				label="Users displayname"
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
		<Button label="Add orgs" type="submit" styleType="normal" ariaLabel="Add orgs"></Button>
	</form>
</div>
