<script lang="ts">
	import '../app.css';
	import Navbar from '../components/navbar.svelte';
	let { children } = $props();
</script>

<Navbar></Navbar>

<main class="flex flex-col items-center bg-background-dark min-h-[var(--main-height)] w-screen text-foreground-dark static py-[var(--nav-height)]">
		{@render children()}
</main>

<style></style>