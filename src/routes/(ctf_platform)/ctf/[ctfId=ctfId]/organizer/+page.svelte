<script lang="ts">
    import { enhance } from '$app/forms';
    import { flip } from 'svelte/animate';
    import { resolve } from '$app/paths';
    import { page } from '$app/state';
    import Button from '$lib/components/Button.svelte';
    import Input from '$lib/components/input/Input.svelte';
    import { LoaderCircle, Plus, Trash2 } from '@lucide/svelte';
    let { data, form } = $props();
    let translations = $derived(data.translations);
</script>

<div class="content">
    <h1 class="route-title">{translations.cuttingedgeadmintools}</h1>
    <ul>
        <li>
            <a
                class="text-primary underline"
                href={resolve('/(ctf_platform)/ctf/[ctfId=ctfId]/organizer/approve', {
                    ctfId: page.params.ctfId ?? '',
                })}>
                {translations.approve}
            </a>
        </li>
    </ul>

    <h3 class="text-2xl">Add new organizer</h3>
    {#if form}
        <div>
            <p class:text-green-500={form.success} class:text-red-500={!form.success}>
                {form.message}
            </p>
        </div>
    {/if}
    <div class="mb-2 flex flex-col">
        <form method="get">
            <Input
                label="User"
                type="search"
                name="searchUser"
                placeholder="eritho23"
                value={page.url.searchParams.get('searchUser')}></Input>
            <Button type="submit" label="Search" />
        </form>
        {#if data.userSearchResults !== undefined}
            {#await data.userSearchResults}
                <LoaderCircle class="animate-spin" size={72} />
            {:then results}
                <ul>
                    {#each results as result (result.id)}
                        <li animate:flip>
                            <div
                                class="bg-bg-700 border-bg-500 flex flex-row space-x-4 rounded-lg border-2 p-4">
                                <span class:font-bold={result.id === data.user?.id}
                                    >{result.display_name ||
                                        result.github_username}</span>
                                <div class="flex-grow"></div>
                                <form method="post" action="?/addOrganizer" use:enhance>
                                    <input
                                        type="hidden"
                                        name="github_username"
                                        value={result.github_username} />
                                    <Button
                                        label=""
                                        styleType="icon"
                                        Icon={Plus}
                                        type="submit" />
                                </form>
                            </div>
                        </li>
                    {/each}
                </ul>
            {:catch}
                <span>Failed to search for users.</span>
            {/await}
        {/if}
    </div>

    <h3 class="text-2xl">Current organizers</h3>
    <ul class="flex w-full flex-col space-y-3">
        {#each data.organizers as organizer (organizer.user?.id)}
            <li animate:flip>
                <div
                    class="bg-bg-700 border-bg-500 flex flex-row space-x-4 rounded-lg border-2 p-4">
                    <span class:font-bold={organizer.user?.id === data.user?.id}
                        >{organizer.user?.display_name ||
                            organizer.user?.github_username}</span>
                    <div class="flex-grow"></div>
                    <form method="post" action="?/deleteOrganizer" use:enhance>
                        <input
                            type="hidden"
                            name="user_id"
                            value={organizer.user?.id ?? ''} />
                        <Button
                            label=""
                            styleType="icon"
                            disabled={!organizer.user?.id ||
                                organizer.user?.id === data.user?.id}
                            Icon={Trash2}
                            type="submit" />
                    </form>
                </div>
            </li>
        {/each}
    </ul>
</div>
