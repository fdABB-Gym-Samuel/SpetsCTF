<script lang="ts">
	let { data } = $props();
	let { translations } = data;
</script>

<header class="hero flex h-[var(--hero-height)] w-full flex-col items-center justify-center">
	<div class="flex flex-row items-center gap-2">
		<img src="/logo.svg" alt="" class="logo w-20" />
		<h1 class="hero-text h-fit text-center font-mono text-5xl sm:text-6xl md:text-8xl">SpetsCTF</h1>
	</div>
	<span class="text-grey-dark">{translations.by_students_for_students}</span>
	<a href="/challenges">{translations.challenges}</a>
	<a href="/ctfs">{translations.ctf}</a>
</header>
