<script lang="ts">
    import { browser } from '$app/environment';
    import { page } from '$app/state';
    import { LogOut } from '@lucide/svelte';
    import Button from '$lib/components/Button.svelte';
    import WarningDialog from '$lib/components/WarningDialog.svelte';
    import { resolve } from '$app/paths';

    let { data } = $props();
    let team = $derived(data.team);
    let teamData = $derived(data.teamData);
    let translations = $derived(data.translations);

    let users = $derived(teamData?.users);

    let userLeavingTeam = $state(false);

    let inviteLink: string = $derived(
        `${page.url.protocol}//${page.url.host}/ctf/${page.params.ctfId}/join_team/${teamData?.join_code}`
    );

    const openLeaveDialog = () => {
        userLeavingTeam = true;
    };
    const closeLeaveDialog = () => {
        userLeavingTeam = false;
    };
</script>

<div class="content flex flex-col items-center">
    <h1 class="text-center text-2xl">{teamData?.name}</h1>
    <a href={teamData?.website}>{teamData?.website}</a>
    <div>
        {#if users}
            <h3>Members:</h3>

            <ul class="users flex flex-row items-center">
                <span class="bg-primary h-8 w-px min-w-px"></span>

                {#each users as user (user)}
                    <li class=" w-full px-2 text-center">
                        {#if user.display_name}
                            <a
                                href={resolve(`/(wargame_platform)/user/[userId]`, {
                                    userId: user.id,
                                })}>{user.display_name}</a>
                        {:else}
                            <p class="italic">Anonymous</p>
                        {/if}
                    </li>
                    <span class="bg-primary h-8 w-px min-w-px"></span>
                {/each}
            </ul>
        {/if}
    </div>
    {#if team && teamData?.id !== team.teamId && teamData.join_code}
        <!-- join_code is null if user is not in the team or is not an org/admin -->
        <div>
            <h3>{translations.invite}</h3>
            <pre><code>{inviteLink}</code></pre>
            <button
                onclick={async () => {
                    if (browser) {
                        await navigator.clipboard.writeText(inviteLink);
                    }
                }}>{translations.copy}</button>
        </div>
    {/if}
    {#if team && teamData?.id === team.teamId}
        <Button
            type="submit"
            name="action"
            value="leave_team"
            label={translations.leave_team}
            styleType="small"
            Icon={LogOut}
            onclick={() => {
                openLeaveDialog();
            }}>
        </Button>
    {/if}
</div>

{#if userLeavingTeam}
    <WarningDialog
        warningTitle={translations.leave_team}
        warningAria={translations.leave_team}
        warningDescription={translations.leave_team_description}
        confirmationButtonText={translations.leave_team}
        confirmationButtonIcon={LogOut}
        hiddenName="action"
        hiddenData="confirm_leave_team"
        close={() => {
            closeLeaveDialog();
        }}></WarningDialog>
{/if}
