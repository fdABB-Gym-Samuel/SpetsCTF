<script lang="ts">
	import { page } from '$app/state';

	let { data } = $props();
	let { teamData, translations } = data;

	let users = teamData?.users;
	$inspect(users);
</script>

<div class="content flex flex-col items-center">
	<h1 class="text-center">{teamData?.name}</h1>
	<a href={teamData?.website}>{teamData?.website}</a>
	<div>
		{#if users}
			<h3>Members:</h3>

			<ul class="users flex flex-row items-center">
				<span class="bg-accent-dark h-8 w-0.5"></span>

				{#each users as string[] as user}
					<!-- TODO investigate how kysely can infer types here -->
					<li class=" w-full text-center">
						<p>{user}</p>
					</li>
					<span class="bg-accent-dark h-8 w-0.5"></span>
				{/each}
			</ul>
		{/if}
	</div>

	<div>
		<h3>{translations.invite}</h3>
		<span>{`${page.url.host}/ctf/${page.params.ctf_id}/join_team/${teamData?.join_code}`}</span>
	</div>
</div>
