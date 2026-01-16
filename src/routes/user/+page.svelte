<script lang="ts">
    import { applyAction, enhance } from '$app/forms';
    import { goto, invalidate } from '$app/navigation';
    let { data, form } = $props();

    import { LogOut, Github } from '@lucide/svelte';
    import { resolve } from '$app/paths';

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
</script>

<div class="content flex flex-col space-y-4 p-4 pt-0">
    <h1 class="mt-2 text-2xl font-bold">{data.translations.settings}</h1>
    {#if form && form?.success}
        <div class="w-fit rounded-md border-2 border-green-500 p-2">
            <span class="text-md font-bold text-green-400"
                >{data.translations.settingsupdated}.</span>
        </div>
    {:else if form && !form?.success}
        <div class="w-fit rounded-md border-2 border-red-400 p-2">
            <span class="font-bold text-red-600"
                >{data.translations.settingsupdatefailed}.</span>
        </div>
    {/if}
    <span class="items-center"
        >{data.translations.currentlyloggedinas}
        <Github class="mr-0 ml-2 inline-block" />
        <a
            target="_blank"
            class="hover:text-primary-light underline duration-200 ease-linear"
            href={`https://github.com/${data.user.github_username}`}
            ><b>{data.user.github_username}</b></a
        >.</span>
    <form
        method="post"
        action="?/logout"
        use:enhance={() => {
            return async ({ result }) => {
                if (result.type === 'success') {
                    await goto(resolve('/'), { invalidateAll: true });
                }
            };
        }}>
        <button
            class="hover:border-primary flex flex-row items-center rounded border px-2 py-1 duration-200 ease-linear hover:cursor-pointer"
            type="submit"
            ><LogOut class="mr-2 size-4 align-middle" />{data.translations
                .logout}</button>
    </form>
    <h2 class="text-xl font-bold">{data.translations.altersettings}</h2>
    <form
        class="flex w-min flex-col space-y-3"
        method="post"
        action="?/settings"
        use:enhance={() => {
            return async ({ result }) => {
                invalidate('data:user');
                applyAction(result);
            };
        }}>
        <label for="display_name" class="text-md font-bold">
            {data.translations.displayname}
        </label>
        <span class="text-text-100">Leave empty to be anonymous.</span>
        <div>
            <input
                class="border-text-100 rounded border p-1"
                value={displayName}
                name="display_name"
                placeholder={data.translations.enterdisplayname}
                id="display_name" />
        </div>

        <label for="represents_class" class="text-md font-bold">
            {data.translations.representclass}
        </label>
        <select
            class="bg-bg-900 text-text-100 border-primary rounded border-2 px-2 py-1"
            name="represents_class"
            id="represents_class"
            value={representedClass}>
            <option value="">{data.translations.selectclass}</option>
            {#each data.availableClasses as availableClass (availableClass.name)}
                <option value={availableClass.name}
                    >{availableClass.name}
                    {availableClass.school ? `(${availableClass.school})` : ''}</option>
            {/each}
        </select>
        <button
            type="submit"
            class="hover:border-primary mt-3 flex w-fit flex-row items-center rounded border px-2 py-1 duration-200 ease-linear hover:cursor-pointer"
            >{data.translations.save}</button>
    </form>

    <div class="h-12"></div>

    {#if data.user && data.user.is_admin}
        <h1 class="text-lg font-bold">{data.translations.admin}</h1>
        <p class="w-72">{data.translations.admin_funny_text}</p>
        <a
            class="hover:text-text-100 text-gray-500 underline duration-200 ease-linear"
            href={resolve('/admin')}>{data.translations.admin_page}</a>
    {/if}
</div>
