<script lang="ts">
	let { data } = $props();
	let { translations } = data;
	import { Wrench } from '@lucide/svelte';

	interface adminLink {
		display: string;
		href: string;
	}

	const adminLinks: adminLink[] = [
		{ href: '/admin/create-challenge', display: translations.createchallenge },
		{ href: '/admin/create-ctf', display: translations.createctf }
	];
</script>

<div class="content">
	<h1>{translations.cuttingedgeadmintools}</h1>
	<ul class="mt-4 flex flex-col space-y-4">
		{#each adminLinks as adminLink}
			<li class="flex flex-row">
				<Wrench class="mr-3" />
				<a class="text-accent-dark underline" href={adminLink.href}>
					{adminLink.display}
				</a>
			</li>
		{/each}
	</ul>
</div>
