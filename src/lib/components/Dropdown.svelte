<script lang="ts">
	let { id, results, primary_name, secondary_name, onSelect, currentSelected } = $props();
</script>

<ol
	{id}
	class="bg-bg-800 border-primary-light absolute mt-18 max-h-50 w-full overflow-y-scroll rounded-md has-first:border-2"
>
	{#each results as result}
		<li
			class="border-bg-500 border-y-1 px-4 py-1.5"
			class:bg-bg-700={results[currentSelected]?.id === result.id}
		>
			<button
				class="w-full text-left"
				onclick={() => {
					onSelect(result['id']);
				}}>{result[primary_name]} ({result[secondary_name]})</button
			>
		</li>
	{/each}
</ol>
