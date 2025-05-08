<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	let { data } = $props();
	let { translations } = data;

	let userSearch = $state('');
	let matchingUsers = $state([{ id: '1', github_username: 'hello', display_name: 'Hello' }]);
	let searchTimeout: null | NodeJS.Timeout | number = null;

	$effect(() => {
		const curr = userSearch;

		if (searchTimeout !== null) {
			clearTimeout(searchTimeout);
		}
		searchTimeout = setTimeout(() => {
			searchUser(curr);
		}, 500);
	});

	const searchUser = (github_username: string) => {
		const body = { githubUserName: github_username };
		fetch('/api/search/users');
	};
	interface adminLink {
		display: string;
		href: string;
	}

	const adminLinks: adminLink[] = [
		{ href: 'organizer/create-challenge', display: translations.createchallenge },
		{ href: 'organizer/approve', display: translations.approve }
	];
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

	<h3>Add new organizer</h3>
	<form action="?/add-org">
		<div class="mb-2 flex flex-col">
			<label for="orgName">Github Username</label>
			<input list="usersList" bind:value={userSearch} />
			<datalist id="usersList">
				{#each matchingUsers as user}
					<option value={user.id}>{user.display_name} (user.github_username)</option>
				{/each}
			</datalist>
		</div>
		<Button label="Add orgs" type="submit" styleType="normal" ariaLabel="Add orgs"></Button>
	</form>
</div>
