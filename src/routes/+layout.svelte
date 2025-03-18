<script lang="ts">
	import '../app.css';
	import Navbar from '../components/navbar.svelte';
	let { children } = $props();
</script>

<Navbar></Navbar>

<main
	class="bg-background-dark text-foreground-dark static flex min-h-[var(--main-height)] w-screen flex-col items-stretch py-[var(--nav-height)]"
>
	{@render children()}
</main>
