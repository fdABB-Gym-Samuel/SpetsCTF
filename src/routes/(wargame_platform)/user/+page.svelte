<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	let { data, form } = $props();
	let { translations, user, availableClasses } = data;
	import { onMount } from 'svelte';

	import { LogOut, Github } from '@lucide/svelte';

	let displayName = $derived.by(() => {
		if (form && form.display_name) {
			return form.display_name;
		} else if (data.user !== undefined && data.user.display_name !== '') {
			return data.user.display_name;
		} else {
			return '';
		}
	});

	let representedClass = $derived.by(() => {
		if (form && form.represents_class) {
			return form.represents_class;
		} else if (data.user && data.user.represents_class) {
			return data.user.represents_class;
		} else {
			return '';
		}
	});

	$inspect(displayName);

	onMount(async () => {
		if (form?.justLoggedOut) {
			await goto('/?justLoggedOut=true');
		}
	});
</script>

<div class="content flex flex-col space-y-4 p-4 pt-0">
	<h1 class="mt-2 text-2xl font-bold">{translations.settings}</h1>
	{#if form && form?.success}
		<div class="w-fit rounded-md border-2 border-green-400 p-2">
			<span class="text-md font-bold text-green-600">{translations.settingsupdated}.</span>
		</div>
	{:else if form && !form?.success}
		<div class="w-fit rounded-md border-2 border-red-400 p-2">
			<span class="font-bold text-red-600">{translations.settingsupdatefailed}.</span>
		</div>
	{/if}
	<span class="items-center"
		>{translations.currentlyloggedinas}
		<Github class="mr-0 ml-2 inline-block" />
		<a
			target="_blank"
			class="underline duration-200 ease-linear hover:text-primary-light"
			href={`https://github.com/${user.github_username}`}><b>{user.github_username}</b></a
		>.</span
	>
	<form method="POST" action="?/logout" use:enhance>
		<button
			class="flex flex-row items-center rounded border px-2 py-1 duration-200 ease-linear hover:cursor-pointer hover:border-primary"
			type="submit"><LogOut class="mr-2 size-4 align-middle" />{translations.logout}</button
		>
	</form>
	<h2 class="text-xl font-bold">{translations.altersettings}</h2>
	<form class="flex w-min flex-col space-y-1" method="POST" action="?/settings" use:enhance>
		<label for="display_name">
			{translations.displayname}
		</label>
		<div>
			<input
				class="rounded border border-black p-1 dark:border-white"
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
			class="bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark rounded border-2 border-primary-light px-2 py-1 dark:border-primary"
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
		<button
			type="submit"
			class="mt-3 flex w-fit flex-row items-center rounded border px-2 py-1 duration-200 ease-linear hover:cursor-pointer hover:border-primary"
			>{translations.save}</button
		>
	</form>

	<div class="h-12"></div>

	{#if data.user && data.user.is_admin}
		<h1 class="text-lg font-bold">{translations.admin}</h1>
		<p class="w-72">{translations.admin_funny_text}</p>
		<a class="text-gray-500 underline duration-200 ease-linear hover:text-white" href="/admin"
			>{translations.admin_page}</a
		>
	{/if}
</div>
