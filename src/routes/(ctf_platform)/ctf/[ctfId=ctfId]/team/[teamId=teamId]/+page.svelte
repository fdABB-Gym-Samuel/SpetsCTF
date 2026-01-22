<script lang="ts">
    import { browser } from '$app/environment';
    import { page } from '$app/state';

    import IconCopyBold from 'phosphor-icons-svelte/IconCopyBold.svelte';
    import IconSignOutBold from 'phosphor-icons-svelte/IconSignOutBold.svelte';

    import Button from '$lib/components/Button.svelte';
    import { resolve } from '$app/paths';
    import { enhance } from '$app/forms';

    let { data } = $props();
    let team = $derived(data.team);
    let teamData = $derived(data.teamData);
    let translations = $derived(data.translations);

    let users = $derived(teamData?.users);

    let inviteLink: string = $derived(
        resolve(`/ctf/${page.params.ctfId}/join-team/${teamData?.join_code}`)
    );
    let inviteLinkDisplay: string = $derived(`${page.url.origin}${inviteLink}`);
</script>

<div class="content mx-auto max-w-fit pt-24">
    <div class="mb-8">
        <h1 class="mb-3 text-[22px]">{teamData?.name}</h1>
        <a class="text-text-150" rel="external" href={teamData?.website}
            >{teamData?.website}</a>
    </div>
    <div class="mb-12">
        {#if users}
            <h3 class="mb-3 text-[18px]">Members:</h3>
            <ul class="users flex flex-row items-center">
                <span class="bg-primary h-0.5 w-4 rounded-sm"></span>
                {#each users as user (user)}
                    <li class="px-3">
                        {#if user.display_name}
                            <a
                                href={resolve(`/user/[userId]`, {
                                    userId: user.id,
                                })}>{user.display_name}</a>
                        {:else}
                            <p class="italic">Anonymous</p>
                        {/if}
                    </li>
                {/each}
                <span class="bg-primary h-0.5 w-4 rounded-sm"></span>
            </ul>
        {/if}
    </div>
    {#if team && teamData?.id === team.teamId && teamData.join_code}
        <div class="mb-12">
            <h3 class="text-[18px]">{translations.invite}</h3>
            <div class="flex items-center gap-3">
                <a href={inviteLink} class="font-mono text-sm" rel="external">
                    {inviteLinkDisplay}
                </a>
                <Button
                    label=""
                    Icon={IconCopyBold}
                    styleType="icon"
                    onclick={async () => {
                        if (browser) {
                            await navigator.clipboard.writeText(inviteLinkDisplay);
                        }
                    }} />
            </div>
        </div>
    {/if}
    {#if team && teamData?.id === team.teamId}
        <form
            method="post"
            use:enhance={({ cancel }) => {
                const ok = confirm(
                    `Do you really want to leave team ${teamData.name}?`
                );
                if (!ok) {
                    cancel();
                }
            }}>
            <Button type="submit" label={translations.leave_team} Icon={IconSignOutBold}
            ></Button>
        </form>
    {/if}
</div>
