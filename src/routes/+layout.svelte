<script lang="ts">
	import '../app.css';
	import Navbar from '../components/navbar.svelte';
	let { children, data } = $props();
	let { user, translations } = data;
</script>

<Navbar {user} {translations}></Navbar>

<main
	class="bg-background-dark text-foreground-dark flex min-h-[var(--main-height)] w-screen flex-col items-stretch py-[var(--nav-height)]"
>
	{@render children()}
</main>
