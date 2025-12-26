<script lang="ts">
    import Button from '$lib/components/Button.svelte';
    import Checkbox from '$lib/components/input/Checkbox.svelte';
    import Input from '$lib/components/input/Input.svelte';
    import ResourceUpload from '$lib/components/ResourceUpload.svelte';
    import Select from '$lib/components/input/Select.svelte';
    import Textarea from '$lib/components/input/Textarea.svelte';

    import type {
        Challenges,
        Flag,
        Category,
        ChallengeResources,
    } from '$lib/generated/db';

    import { categories } from '$lib/db/constants';
    import { enhance } from '$app/forms';
    import type { Selectable } from 'kysely';
    import { onMount } from 'svelte';

    interface Props {
        action?: string;
        challengeData?: Challenges & { flag: Flag } & {
            challenge_category: Category;
        } & { resources: ChallengeResources };
        editing: boolean;
        formName: string;
        isAuthor: boolean;
        submitText: string;
    }

    let { formName, submitText, action, editing, isAuthor, challengeData }: Props =
        $props();

    let description: string = $state('');
    let displayName: string = $state('');
    let flag: string = $state('');
    let flagFormat: string = $state('');
    let points: number = $state(0);
    let mainCategory: Selectable<Challenges>['challenge_category'] = $state('misc');
    let resources: Selectable<ChallengeResources>[] = $state([]);

    onMount(() => {
        description = challengeData?.description ?? '';
        displayName = challengeData?.display_name ?? '';
        flag = challengeData?.flag.flag ?? '';
        flagFormat = challengeData?.flag.flag_format ?? '';
        mainCategory = challengeData?.challenge_category ?? 'misc';
        points = challengeData?.points ?? 0;
        resources = challengeData?.resources ?? [];
    });

    let categoryOptions = categories.map((category) => ({
        value: category,
        text: category.charAt(0).toUpperCase() + category.slice(1),
    }));
    let possibleSubCategories = $derived.by(() =>
        categoryOptions.filter((category) => category.value !== mainCategory)
    );
    let selectedSubCategories: string[] = $state([]);
    selectedSubCategories = categories.filter(
        (_, index) =>
            challengeData?.challenge_sub_categories.split('').reverse().join('')[
                index
            ] === '1'
    );

    let privacyOptions = $derived([
        { text: 'Author Anonymous', value: 'author_anonymous', disabled: !isAuthor },
    ]);

    let privacySelected = $state(['author_anonymous']);

    let submitButtonDisabled = $derived(
        !displayName || !flag || !points || !mainCategory
    );
</script>

<p class="text-sm"><span class="text-primary-light">*</span>: Required</p>
{#if !isAuthor}
    <p class="text-sm">
        <span class="text-point-500">*</span>: User lacks permissions to edit
    </p>
{/if}
<form
    {action}
    method="POST"
    id={formName}
    enctype="multipart/form-data"
    class="flex flex-row flex-wrap justify-around gap-x-10 gap-y-4"
    use:enhance>
    <section class="flex max-w-200 min-w-80 flex-grow flex-col gap-4">
        <Input
            label="Challenge display name"
            bind:value={displayName}
            type="text"
            placeholder="Enter a FIRE 🔥 name."
            name="display_name"
            required={true}></Input>
        <!-- <Input
			label="Challenge description"
			bind:value={description}
			type="text"
			placeholder="Write a description for your challenge"
			name="description"
		></Input> -->
        <Textarea
            label="Challenge description"
            placeholder="Write a description for your challenge"
            name="description"
            bind:value={description}></Textarea>
        <Input
            label="Flag"
            bind:value={flag}
            type="text"
            placeholder="Enter a secret flag 🚩"
            name="flag"
            required={true}></Input>
        <Input
            label="Flag Format"
            bind:value={flagFormat}
            type="text"
            placeholder="SPETSCTF&#123...&#125"
            name="flag_format"></Input>

        <Checkbox
            title="Privacy"
            name="privacy"
            options={privacyOptions}
            bind:selected={privacySelected}></Checkbox>
    </section>
    <section class="flex max-w-200 min-w-80 flex-grow flex-col gap-4">
        <Input
            label="Points"
            bind:value={points}
            type="number"
            placeholder="Enter the points one will recieve for solving your challenge"
            name="points"
            required={true}></Input>
        <Select
            label="Main Category"
            bind:value={mainCategory}
            name="challenge_category"
            id="categorySelection"
            options={categoryOptions}
            required={true}></Select>
        <Checkbox
            title="Sub Categories"
            name="sub_categories"
            options={possibleSubCategories}
            bind:selected={selectedSubCategories}></Checkbox>
    </section>
</form>
<section class="mb-4">
    <ResourceUpload form={formName} resourceData={resources}></ResourceUpload>
</section>

<Button
    label={submitText}
    type="submit"
    ariaLabel={submitText}
    disabled={submitButtonDisabled}
    form={formName}></Button>
