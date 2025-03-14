<script lang="ts">
	import '../app.css';
	let { children, data } = $props();
	let { translations } = data;
</script>

<nav>
	<ul class="flex flex-row space-x-2">
		<li>{translations.home}</li>
		<li>{translations.ctf}</li>
		<li>{translations.results}</li>
		<li><a href="/about">{translations.about}</a></li>
	</ul>
</nav>

<main class="text-red-525">
	{@render children()}
</main>
