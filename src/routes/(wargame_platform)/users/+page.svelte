<script lang="ts">
	let { data } = $props();
	let { users, translations } = data;
</script>

<div class="content">
	<h1 class="route-title">{translations.users}</h1>
	<ul class="w-full">
		{#each users as user, i}
			<li
				class="bg-background-light dark:bg-background-dark w-full border-b-1 px-2 py-2"
				class:border-t-1={i === 0}
				class:dark:bg-stone-700={i % 2 === 0}
				class:bg-stone-200={i % 2 === 0}
			>
				<a class="ignore-default underline" href={`/user/${user.id}`}>{user.display_name}</a>
			</li>
		{/each}
	</ul>
</div>
