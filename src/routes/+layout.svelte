<script lang="ts">
	import '../app.css';
	import Navbar from '../components/navbar.svelte';
	let { children } = $props();
</script>


<!-- <nav class="h-[var(--nav-height)] flex flex-row bg-background-dark text-foreground-dark sticky justify-between px-4 items-center outline-1 outline-[var(--color-accent-dark)]">
		<div class="left flex flex-row items-center">
			<ul class="flex flex-row h-full space-x-2 justify-evenly items-center">
				<li class="mr-4"><a href="/"><img src="/logo.svg" alt="" class="logo h-10"></a></li>
				<li class="mr-4"><a href="/challenges">Challenges</a></li>
				<li class="mr-4"><a href="/scoreboard">Scoreboard</a></li>
				<li class="mr-4"><a href="/about">About</a></li>
			</ul>
			<span class="separator bg-accent-dark h-8 w-0.5"></span>
		</div>
		<div class="right">
			<button class="login-btn bg-button-dark px-6 py-2 rounded-[var(--button-radius)] font-semibold">Log In</button>
		</div>
</nav> -->
<Navbar></Navbar>

<main class="flex flex-col items-center bg-background-dark min-h-[var(--main-height)] text-foreground-dark">
		{@render children()}
</main>

<style>
	.screen-nav-height{
		min-height: calc(100vh - 4em)
	}
</style>

