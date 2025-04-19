<script lang="ts">
	let { data } = $props();
	let { translations } = data;

	interface adminLink {
		display: string;
		href: string;
	}

	const adminLinks: adminLink[] = [
		{ href: 'organizer/create-challenge', display: translations.createchallenge },
		{ href: 'organizer/approve', display: translations.approve }
	];
</script>

<div class="content">
	<h1 class="route-title">{translations.cuttingedgeadmintools}</h1>
	<ul>
		{#each adminLinks as adminLink}
			<li>
				<a class="text-accent-dark underline" href={adminLink.href}>
					{adminLink.display}
				</a>
			</li>
		{/each}
	</ul>
</div>
