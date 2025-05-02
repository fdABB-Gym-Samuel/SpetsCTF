<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	let { data, form } = $props();
	let { translations, user, availableClasses } = data;
	import { onMount } from 'svelte';

	onMount(async () => {
		if (form?.justLoggedOut) {
			await goto('/', {
				invalidateAll: true
			});
		}
	});
</script>

<div class="flex flex-col space-y-4 p-4">
	<h1>{translations.settings}</h1>
	{#if form && form?.success}
		<span class="font-bold text-green-600">{translations.settingsupdated}.</span>
	{:else if form && !form?.success}
		<span class="font-bold text-red-600">{translations.settingsupdatefailed}.</span>
	{/if}
	<span>{translations.currentlyloggedinas} <b>{user.github_username}</b>.</span>
	<form method="POST" action="?/logout" use:enhance>
		<button type="submit">{translations.logout}</button>
	</form>
	<h2 class="text-xl font-bold">{translations.altersettings}</h2>
	<form class="flex w-min flex-col space-y-1" method="POST" action="?/settings" use:enhance>
		<label for="display_name">
			{translations.displayname}
		</label>
		<div>
			<input
				class="border border-black p-1 dark:border-white"
				value={form?.display_name ?? user.display_name ?? ''}
				name="display_name"
				placeholder={translations.enterdisplayname}
				id="display_name"
			/>
		</div>

		<br />
		<label for="represents_class">
			{translations.representclass}
		</label>
		<br />
		<select
			class="border-accent-light dark:border-accent-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark border p-1"
			name="represents_class"
			id="represents_class"
			value={form?.represents_class ?? user.represents_class ?? ''}
		>
			<option value="">{translations.selectclass}</option>
			{#each availableClasses as availableClass}
				<option value={availableClass.name}>{availableClass.name} ({availableClass.school})</option>
			{/each}
		</select>
		<button type="submit" class="mt-3">{translations.submit}</button>
	</form>
</div>
