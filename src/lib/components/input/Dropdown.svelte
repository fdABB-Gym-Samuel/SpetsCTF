<script lang="ts">
	let {
		id,
		results,
		primary_name,
		secondary_name,
		onSelect,
		currentSelected = $bindable()
	} = $props();
</script>

<ol
	{id}
	class="bg-bg-800 border-primary-light absolute mt-18 max-h-50 w-full overflow-y-scroll rounded-md has-first:border-2"
>
	{#each results as result}
		<li class="" class:bg-bg-500={results[currentSelected]?.id === result.id}>
			<button
				class="border-bg-500 w-full border-y-1 px-6 py-1.5 text-left"
				onmousedown={(e: MouseEvent) => {
					onSelect(result);
				}}>{result[primary_name]} ({result[secondary_name]})</button
			>
		</li>
	{/each}
</ol>
