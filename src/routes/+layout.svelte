<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>


<nav class="h-16 flex bg-background-dark text-foreground-dark sticky justify-between flex-col items-center">
	<div class="top flex flex-row w-full justify-between py-2 px-4">
		<div class="left flex flex-row items-center">
			<ul class="flex flex-row h-full space-x-2 justify-evenly items-center">
				<li class="mr-4"><a href="/"><img src="/logo.svg" alt="" class="logo h-10"></a></li>
				<li class="mr-4"><a href="/challenges">Challenges</a></li>
				<li class="mr-4"><a href="/scoreboard">Scoreboard</a></li>
				<li class="mr-4"><a href="/about">About</a></li>
				<!-- <li class="mr-4 w-1"><span class="separator bg-grey-dark w-1 h-full"></span></li> -->
			</ul>
			<span class="separator bg-grey-light h-8 w-0.5"></span>
		</div>
		<div class="right">
			<button class="login-btn bg-button-dark px-6 py-2 rounded-[var(--button-radius)] font-semibold">Log In</button>
		</div>
	</div>
	<div class="bottom w-full p-1 h-2">
		<div class=" w-full bg-grey-dark h-px"></div>
	</div>
</nav>

<main class="flex flex-col items-center bg-background-dark screen-nav-height text-foreground-dark">
		{@render children()}
</main>

<style>
	.screen-nav-height{
		height: calc(100vh - 4em)
	}
</style>

