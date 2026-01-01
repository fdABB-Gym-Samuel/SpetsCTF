<script lang="ts">
    import { enhance } from '$app/forms';
    let { data, form } = $props();

    import Button from '$lib/components/Button.svelte';
    import Checkbox from '$lib/components/input/Checkbox.svelte';
    import Input from '$lib/components/input/Input.svelte';
    // import ResourceUpload from '$lib/components/ResourceUpload.svelte';
    import Select from '$lib/components/input/Select.svelte';
    import Textarea from '$lib/components/input/Textarea.svelte';

    import { categories, resourceTypes } from '$lib/db/constants';
    import { onMount } from 'svelte';

    import { bitsetToSelectedCategories } from '$lib/bitset';
    import { FileTerminal, Globe, Paperclip, Trash } from '@lucide/svelte';

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

    let newResourceFormType = $state('web');
</script>

<main class="pt-8">
    {#if form}
        <div
            class:border-green-600={form?.success}
            class:border-red-600={!form?.success}
            class="w-min rounded border-2 px-2 py-1">
            {#if form?.success}
                Success
            {:else}
                {form?.message}
            {/if}
        </div>
    {/if}
    <p class="text-sm"><span class="text-primary-light">*</span>: Required</p>
    <form
        id={formId}
        method="post"
        enctype="multipart/form-data"
        class="grid grid-cols-1 justify-around gap-x-10 gap-y-4 lg:grid-cols-2"
        use:enhance>
        <section class="flex max-w-200 min-w-80 flex-grow flex-col gap-4">
            <Input
                label="Challenge display name"
                value={data.challenge.display_name}
                type="text"
                placeholder="Enter a FIRE 🔥 name."
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
                placeholder="Enter a secret flag 🚩"
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
                selected={data.challenge.anonymous_author ? ['author_anonymous'] : []}
            ></Checkbox>
        </section>
        <section class="flex max-w-200 min-w-80 flex-grow flex-col gap-4">
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
                bind:selected={selectedSubCategories}></Checkbox>
        </section>
        <!--
            <section class="mb-4">
                <ResourceUpload form={formId} resourceData={data.resources}
                ></ResourceUpload>
            </section>
        -->
        <Button label="Save" type="submit"></Button>
    </form>

    <section id="resources">
        <h2>Challenge Resources</h2>

        <div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {#each data.resources as resource (resource.id)}
                <div class="bg-bg-700 border-bg-500 rounded-lg border-2 p-4">
                    <div class="flex flex-row space-x-2">
                        {#if resource.type === 'web'}
                            <Globe />
                        {:else if resource.type === 'file'}
                            <Paperclip />
                        {:else if resource.type === 'cmd'}
                            <FileTerminal />
                        {/if}
                        {#if resource.type === 'web'}
                            <a href={resource.content}>{resource.content}</a>
                        {:else if resource.type === 'file'}
                            {resource.content}
                        {:else if resource.type === 'cmd'}
                            <span class="font-mono">{resource.content}</span>
                        {/if}
                        <div class="flex-grow"></div>
                        <form method="post" action="?/deleteResource" use:enhance>
                            <input
                                type="hidden"
                                value={resource.id}
                                name="resource_id" />
                            <Button
                                type="submit"
                                label=""
                                styleType="icon"
                                iconSize={'20'}
                                Icon={Trash} />
                        </form>
                    </div>
                </div>
            {/each}
        </div>

        <form method="post" action="?/createResource" use:enhance>
            <Select
                bind:value={newResourceFormType}
                name="resource_type"
                label="Choose type"
                options={resourceTypes
                    .map((elem) => {
                        return {
                            value: elem,
                            text:
                                elem === 'cmd'
                                    ? 'Command'
                                    : elem.charAt(0).toUpperCase() + elem.substring(1),
                        };
                    })
                    .sort((a, b) => {
                        return a.value < b.value ? -1 : 1;
                    })} />
            {#if newResourceFormType === 'cmd' || newResourceFormType === 'web'}
                <Input
                    type="text"
                    name="content"
                    label="Content"
                    placeholder="Enter the resource content" />
            {:else if newResourceFormType === 'file'}
                <Input
                    type="file"
                    name="challenge_file"
                    label="Choose a file"
                    placeholder="" />
            {/if}
            <Button type="submit" label="Create resource" />
        </form>
    </section>
</main>
