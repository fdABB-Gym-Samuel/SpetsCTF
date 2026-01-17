<script lang="ts">
    import { browser } from '$app/environment';
    import { page } from '$app/state';
    import { Copy, LogOut } from '@lucide/svelte';
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
</script>

<div class="content flex flex-col items-center">
    <h1 class="text-center text-2xl">{teamData?.name}</h1>
    <a rel="external" href={teamData?.website}>{teamData?.website}</a>
    <div>
        {#if users}
            <h3>Members:</h3>

            <ul class="users flex flex-row items-center">
                <span class="bg-primary h-8 w-px min-w-px"></span>

                {#each users as user (user)}
                    <li class=" w-full px-2 text-center">
                        {#if user.display_name}
                            <a
                                href={resolve(`/user/[userId]`, {
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
            <Button
                label=""
                Icon={Copy}
                styleType="icon"
                onclick={async () => {
                    if (browser) {
                        await navigator.clipboard.writeText(inviteLink);
                    }
                }} />
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
            <Button
                type="submit"
                label={translations.leave_team}
                styleType="small"
                Icon={LogOut}>
            </Button>
        </form>
    {/if}
</div>
