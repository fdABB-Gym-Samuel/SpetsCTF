<script lang="ts">
	import { enhance } from '$app/forms';
	let { data, form } = $props();
	let { translations } = data;
</script>

<div class="content">
	<h1 class="route-title">{translations.register_team}</h1>
	{#if form}
		<span class="text-red-600">{translations.failure}: {form.message}</span>
	{/if}
	<form method="POST" class="flex flex-col gap-2" use:enhance>
		<div class="flex flex-col">
			<label for="team_name">{translations.team_name}</label>
			<input type="text" name="team_name" placeholder="🔥 Name" />
		</div>
		<div class="flex flex-col">
			<label for="team_website">{translations.team_website}</label>
			<input type="text" name="team_website" placeholder="github.com/fdABB-Gym-Samuel/SpetsCTF" />
		</div>
		<button type="submit">Create Team</button>
	</form>
</div>
