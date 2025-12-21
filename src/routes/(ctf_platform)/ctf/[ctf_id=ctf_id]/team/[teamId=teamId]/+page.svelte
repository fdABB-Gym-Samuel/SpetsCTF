<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';

	let { data } = $props();
	let teamData = $derived(data.teamData)
	let translations = $derived(data.translations)

	let users = $derived(teamData?.users);

	let inviteLink: string = $derived(
		`${page.url.protocol}//${page.url.host}/ctf/${page.params.ctf_id}/join_team/${teamData?.join_code}`
	);
</script>

<div class="content flex flex-col items-center">
	<h1 class="text-center">{teamData?.name}</h1>
	<a href={teamData?.website}>{teamData?.website}</a>
	<div>
		{#if users}
			<h3>Members:</h3>

			<ul class="users flex flex-row items-center">
				<span class="bg-primary h-8 w-0.5"></span>

				{#each users as string[] as user (user)}
					<li class=" w-full text-center">
						<p>{user}</p>
					</li>
					<span class="bg-primary h-8 w-0.5"></span>
				{/each}
			</ul>
		{/if}
	</div>

	<div>
		<h3>{translations.invite}</h3>
		<pre><code>{inviteLink}</code></pre>
		<button
			onclick={async () => {
				if (browser) {
					await navigator.clipboard.writeText(inviteLink);
				}
			}}>{translations.copy}</button
		>
	</div>
</div>
