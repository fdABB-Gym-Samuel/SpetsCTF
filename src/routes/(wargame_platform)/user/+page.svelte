<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	let { data, form } = $props();
	let { translations, user, availableClasses } = data;
	import { onMount } from 'svelte';

	import { LogOut, Github } from '@lucide/svelte';

	let displayName = $derived.by(() => {
		if (form && form.display_name) {
			return form.display_name
		} else if (data.user !== undefined && data.user.display_name !== '') {
			return data.user.display_name
		} else {
			return '';
		}
	})

	let representedClass = $derived.by(() => {
		if (form && form.represents_class) {
			return form.represents_class
		} else if (data.user && data.user.represents_class) {
			return data.user.represents_class
		} else {
			return ''
		}
	})

	$inspect(displayName)

	onMount(async () => {
		if (form?.justLoggedOut) {
			await goto('/?justLoggedOut=true');
		}
	});
</script>

<div class="content flex flex-col space-y-4 p-4 pt-0">
	<h1 class="text-2xl font-bold mt-2">{translations.settings}</h1>
	{#if form && form?.success}
		<div class="rounded-md border-2 border-green-400 p-2 w-fit">
			<span class="font-bold text-green-600 text-md">{translations.settingsupdated}.</span>
		</div>
	{:else if form && !form?.success}
		<div class="rounded-md border-2 border-red-400 p-2 w-fit">
			<span class="font-bold text-red-600">{translations.settingsupdatefailed}.</span>
		</div>
	{/if}
	<span class="items-center">{translations.currentlyloggedinas} <Github class="inline-block ml-2 mr-0" /> <a target="_blank" class="hover:text-purple-400 underline duration-200 ease-linear" href={`https://github.com/${user.github_username}`}><b>{user.github_username}</b></a>.</span>
	<form  method="POST" action="?/logout" use:enhance>
		<button class="flex flex-row duration-200 ease-linear items-center px-2 py-1 hover:cursor-pointer hover:border-purple-500 rounded border" type="submit"><LogOut class="align-middle size-4 mr-2" />{translations.logout}</button>
	</form>
	<h2 class="text-xl font-bold">{translations.altersettings}</h2>
	<form class="flex w-min flex-col space-y-1" method="POST" action="?/settings" use:enhance>
		<label for="display_name">
			{translations.displayname}
		</label>
		<div>
			<input
				class="border border-black p-1 dark:border-white rounded"
				value={displayName}
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
			class="border-purple-500 dark:border-purple-600 bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark border-2 px-2 py-1 rounded"
			name="represents_class"
			id="represents_class"
			value={representedClass}
		>
			<option value="">{translations.selectclass}</option>
			{#each availableClasses as availableClass}
				<option value={availableClass.name}
					>{availableClass.name} {availableClass.school ? `(${availableClass.school})` : ''}</option
				>
			{/each}
		</select>
		<button type="submit" class="mt-3 flex w-fit flex-row duration-200 ease-linear items-center px-2 py-1 hover:cursor-pointer hover:border-purple-500 rounded border">{translations.save}</button>
	</form>

	<div class="h-12"></div>

	{#if data.user && data.user.is_admin}
		<h1 class="text-lg font-bold">{translations.admin}</h1>
		<p class="w-72">{translations.admin_funny_text}</p>
		<a class="text-gray-500 underline hover:text-white duration-200 ease-linear" href="/admin">{translations.admin_page}</a>
	{/if}
</div>
