<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<nav>
	<ul class="flex flex-row space-x-2">
		<li>Home</li>
		<li>CTF</li>
		<li>Results</li>
		<li><a href="/about">About</a></li>
	</ul>
</nav>

<main class="text-red-525">
	{@render children()}
</main>

<style>
	
</style>

