<script lang="ts">
	export let user_name: string | undefined = undefined;
</script>

<nav
	class="bg-background-dark text-foreground-dark fixed top-0 flex h-[var(--nav-height)] w-full flex-row items-center justify-between px-4 outline-1 outline-[var(--color-accent-dark)]"
>
	<div class="left flex flex-row items-center">
		<ul class="flex h-full flex-row items-center justify-evenly space-x-2">
			<li class="mr-4">
				<a class="nav-option underline" href="/"><img src="/logo.svg" alt="" class="logo h-10" /></a
				>
			</li>
			<li class="mr-4"><a class="nav-option underline" href="/challenges">Challenges</a></li>
			<!-- <li class="mr-4"><a class="underline nav-option" href="/writeups">Writeups</a></li> -->
			<li class="mr-4"><a class="nav-option underline" href="/scoreboard">Scoreboard</a></li>
			<li class="mr-4"><a class="nav-option underline" href="/about">About</a></li>
		</ul>
		<span class="separator bg-accent-dark h-8 w-0.5"></span>
	</div>
	<div class="right">
		{#if user_name}
			<p>{user_name}</p>
		{:else}
			<button
				onclick={(window.location = '/login')}
				class="login-btn bg-button-dark rounded-[var(--button-radius)] px-6 py-2 font-semibold"
				>Log In</button
			>
		{/if}
	</div>
</nav>
