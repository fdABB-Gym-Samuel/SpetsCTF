<script lang="ts">
    import { flip } from 'svelte/animate';
    import { enhance } from '$app/forms';
    import { resolve } from '$app/paths';
    import { page } from '$app/state';
    let { data, form } = $props();

    import { goto } from '$app/navigation';

    import Button from '$lib/components/Button.svelte';
    import Checkbox from '$lib/components/input/Checkbox.svelte';
    import Input from '$lib/components/input/Input.svelte';
    import Select from '$lib/components/input/Select.svelte';
    import Textarea from '$lib/components/input/Textarea.svelte';

    import { categories, resourceTypes } from '$lib/db/constants';
    import { onMount } from 'svelte';

    import { bitsetToSelectedCategories } from '$lib/bitset';

    import IconDownloadSimpleBold from 'phosphor-icons-svelte/IconDownloadSimpleBold.svelte';
    import IconTrashBold from 'phosphor-icons-svelte/IconTrashBold.svelte';
    import IconTerminalBold from 'phosphor-icons-svelte/IconTerminalBold.svelte';
    import IconFileBold from 'phosphor-icons-svelte/IconFileBold.svelte';
    import IconGlobeBold from 'phosphor-icons-svelte/IconGlobeBold.svelte';

    import { X, Check, UserCog } from '@lucide/svelte';
    import { linkPattern } from '$lib/utils/utils.js';

    const uid = $props.id();
    const formId = `form-${uid}`;

    const categoryOptions = categories.map((elem) => {
        return {
            value: elem,
            text: elem.charAt(0).toUpperCase() + elem.slice(1),
        };
    });

    const privacyOptions: { text: string; disabled: boolean; value: string }[] = [
        {
            text: 'Anonymous',
            value: 'author_anonymous',
            disabled: false,
        },
    ];

    let showApproveForm = $derived(
        data.user && data.user.is_admin && !data.challenge.approved
    );
    let showDisapproveForm = $derived(
        data.user && data.user.is_admin && data.challenge.approved
    );

    let mainCategory = $state('misc');
    let selectedSubCategories: string[] = $state([]);
    onMount(() => {
        mainCategory = data.challenge.challenge_category;
        selectedSubCategories = bitsetToSelectedCategories(
            categories,
            data.challenge.challenge_sub_categories
        );
    });

    let possibleSubCategories = $derived.by(() =>
        categories
            .filter((category) => category !== mainCategory)
            .map((elem) => {
                return {
                    text: elem.charAt(0).toUpperCase() + elem.slice(1),
                    disabled: false,
                    value: elem,
                };
            })
    );

    let newResourceFormType = $state('cmd');
</script>

<main class="mx-auto w-full max-w-7xl px-4 pt-20 pb-12">
    <div class="flex flex-col gap-6">
        {#if showApproveForm}
            <section id="approve" class="rounded-lg border-2 border-green-600 p-4">
                <div class="mb-3 flex flex-row items-center space-x-3">
                    <UserCog />
                    <h2 class="text-xl font-semibold">Admin: Approve Challenge</h2>
                </div>
                <form method="post" use:enhance action="?/approveChallenge">
                    <input
                        type="hidden"
                        value={page.params.challengeId}
                        name="challenge_id" />
                    <Button type="submit" Icon={Check} label="Approve Challenge" />
                </form>
            </section>
        {/if}

        {#if showDisapproveForm}
            <section id="disapprove" class="rounded-lg border-2 border-red-600 p-4">
                <div class="mb-3 flex flex-row items-center space-x-3">
                    <UserCog />
                    <h2 class="text-xl font-semibold">Admin: Disapprove Challenge</h2>
                </div>
                <form method="post" use:enhance action="?/disapproveChallenge">
                    <input
                        type="hidden"
                        value={page.params.challengeId}
                        name="challenge_id" />
                    <Button type="submit" Icon={X} label="Disapprove Challenge" />
                </form>
            </section>
        {/if}

        {#if form}
            <div
                class:border-green-600={form.success}
                class:border-red-600={!form.success}
                class="rounded-md border-3 px-4 py-3">
                {#if form.success}
                    <p class="font-semibold">Success</p>
                {:else}
                    <p class="text-red-400">{form.message}</p>
                {/if}
            </div>
        {/if}

        {#if data.ctf !== undefined}
            <div class="rounded-md border-2 border-blue-500 px-4 py-3">
                <p class="mb-2">
                    This challenge is part of the CTF <a
                        href={resolve(`/(ctf_platform)/ctf/[ctfId=ctfId]`, {
                            ctfId: data.ctf.id.toString(),
                        })}
                        class="font-semibold underline">{data.ctf.display_name}</a
                    >.
                </p>
                <span class="font-semibold">This means that:</span>
                <ul class="mt-1 ml-6 list-disc space-y-1">
                    <li>
                        Organizers of the CTF may approve this challenge for inclusion
                        in the CTF.
                    </li>
                    <li>The challenge will not be available until the CTF starts.</li>
                </ul>
            </div>
        {/if}

        <p class="text-sm">
            <span class="text-primary-light">*</span> = Required
        </p>

        <form
            id={formId}
            action="?/editChallenge"
            method="post"
            enctype="multipart/form-data"
            class="flex flex-col gap-6"
            use:enhance>
            <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <section class="flex flex-col gap-4">
                    <h3 class="text-lg font-semibold">Basic Information</h3>
                    <Input
                        label="Challenge display name"
                        value={data.challenge.display_name}
                        type="text"
                        placeholder="Enter a fire name"
                        name="display_name"
                        required={true}></Input>
                    <Textarea
                        label="Challenge description"
                        placeholder="Write a description for your challenge"
                        name="description"
                        value={data.challenge.description}></Textarea>
                    <Input
                        label="Flag"
                        value={data.flag.flag}
                        type="text"
                        placeholder="Enter a secret flag"
                        name="flag"
                        required={true}></Input>
                    <Input
                        label="Flag Format"
                        value={data.flag.flag_format}
                        type="text"
                        placeholder="SPETSCTF&#123...&#125"
                        name="flag_format"></Input>
                    <Checkbox
                        title="Privacy"
                        name="privacy"
                        options={privacyOptions}
                        selected={data.challenge.anonymous_author
                            ? ['author_anonymous']
                            : []}></Checkbox>
                </section>

                <section class="flex flex-col gap-4">
                    <h3 class="text-lg font-semibold">Challenge Settings</h3>
                    <Input
                        label="Points"
                        value={data.challenge.points}
                        type="number"
                        placeholder="Enter the points one will recieve for solving your challenge"
                        name="points"
                        required={true}></Input>
                    <Select
                        label="Main Category"
                        bind:value={mainCategory}
                        name="challenge_category"
                        options={categoryOptions}
                        required={true}></Select>
                    <Checkbox
                        title="Sub Categories"
                        name="sub_categories"
                        options={possibleSubCategories}
                        bind:selected={selectedSubCategories}
                        alignCheckboxes={true}></Checkbox>
                </section>
            </div>

            <div class="flex justify-end">
                <Button label="Save Changes" type="submit" inverted={true}></Button>
            </div>
        </form>

        <section id="resources" class="mt-8">
            <h2 class="text-[22px] font-semibold">Challenge Resources</h2>

            {#if data.resources.length > 0}
                <div class="mt-4 mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {#each data.resources as resource (resource.id)}
                        <div class="bg-bg-700 rounded-lg px-4 py-3" animate:flip>
                            <div class="flex flex-row items-center gap-3">
                                <div class="shrink-0 *:text-[20px]">
                                    {#if resource.type === 'web'}
                                        <IconGlobeBold />
                                    {:else if resource.type === 'file'}
                                        <IconFileBold />
                                    {:else if resource.type === 'cmd'}
                                        <IconTerminalBold />
                                    {/if}
                                </div>
                                <div class="min-w-0 flex-1">
                                    {#if resource.type === 'web'}
                                        <a
                                            rel="external"
                                            href={`${resource.content}`}
                                            class="truncate hover:underline"
                                            >{resource.content}</a>
                                    {:else if resource.type === 'file'}
                                        <span class="truncate">{resource.content}</span>
                                    {:else if resource.type === 'cmd'}
                                        <span class="truncate font-mono text-sm"
                                            >{resource.content}</span>
                                    {/if}
                                </div>
                                <div class="flex shrink-0 gap-2">
                                    {#if resource.type === 'file'}
                                        <Button
                                            styleType="icon"
                                            label=""
                                            iconSize="20"
                                            hoverColor="hover:bg-bg-600"
                                            Icon={IconDownloadSimpleBold}
                                            onclick={() => {
                                                goto(
                                                    resolve(
                                                        `/files/${data.challenge.challenge_id}/${resource.content}`
                                                    )
                                                );
                                            }}></Button>
                                    {/if}
                                    <form
                                        method="post"
                                        action="?/deleteResource"
                                        use:enhance>
                                        <input
                                            type="hidden"
                                            value={resource.id}
                                            name="resource_id" />
                                        <Button
                                            type="submit"
                                            label=""
                                            hoverColor="hover:bg-bg-600"
                                            styleType="icon"
                                            iconSize="20"
                                            Icon={IconTrashBold} />
                                    </form>
                                </div>
                            </div>
                        </div>
                    {/each}
                </div>
            {:else}
                <p class="text-text-300 mb-6 italic">No resources added yet.</p>
            {/if}

            <div class="bg-bg-850 rounded-lg px-6 py-4">
                <h3 class="mb-4 text-lg font-semibold">Add New Resource</h3>
                <form
                    method="post"
                    action="?/createResource"
                    enctype="multipart/form-data"
                    use:enhance
                    class="flex flex-col gap-4">
                    <div class="flex gap-8">
                        <div class="w-96">
                            <Select
                                bind:value={newResourceFormType}
                                name="resource_type"
                                label="Resource Type"
                                options={resourceTypes
                                    .map((elem) => {
                                        return {
                                            value: elem,
                                            text:
                                                elem === 'cmd'
                                                    ? 'Command'
                                                    : elem.charAt(0).toUpperCase() +
                                                      elem.substring(1),
                                        };
                                    })
                                    .sort((a, b) => {
                                        return a.value < b.value ? -1 : 1;
                                    })} />
                        </div>
                        {#if newResourceFormType === 'cmd'}
                            <Input
                                type="text"
                                name="content"
                                label="Content"
                                placeholder="Enter the resource content" />
                        {:else if newResourceFormType === 'web'}
                            <Input
                                type="text"
                                name="content"
                                pattern={linkPattern.source}
                                label="Content"
                                placeholder="Enter the resource content" />
                        {:else if newResourceFormType === 'file'}
                            <Input
                                type="file"
                                name="file"
                                label="Choose a file"
                                placeholder="" />
                        {/if}
                    </div>
                    <div class="flex justify-end">
                        <Button type="submit" label="Create resource" />
                    </div>
                </form>
            </div>
        </section>
    </div>
</main>
