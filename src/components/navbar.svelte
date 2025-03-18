<script lang="ts">
    export let user_name:string | undefined = undefined;
</script>

<nav class="h-[var(--nav-height)] w-full flex flex-row bg-background-dark text-foreground-dark fixed justify-between px-4 items-center outline-1 outline-[var(--color-accent-dark)] top-0">
    <div class="left flex flex-row items-center">
        <ul class="flex flex-row h-full space-x-2 justify-evenly items-center">
            <li class="mr-4"><a class="underline nav-option" href="/"><img src="/logo.svg" alt="" class="logo h-10"></a></li>
            <li class="mr-4"><a class="underline nav-option" href="/challenges">Challenges</a></li>
            <!-- <li class="mr-4"><a class="underline nav-option" href="/writeups">Writeups</a></li> -->
            <li class="mr-4"><a class="underline nav-option" href="/scoreboard">Scoreboard</a></li>
            <li class="mr-4"><a class="underline nav-option" href="/about">About</a></li>
        </ul>
        <span class="separator bg-accent-dark h-8 w-0.5"></span>
    </div>
    <div class="right">
        {#if user_name}
        <p>{user_name}</p>
        {:else}
        <button onclick={window.location="/login"} class="login-btn bg-button-dark px-6 py-2 rounded-[var(--button-radius)] font-semibold">Log In</button>
        {/if}
    </div>
</nav>