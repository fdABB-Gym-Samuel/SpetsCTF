<script lang="ts">
	let { title, options, selected = $bindable([]), name } = $props();
	console.log(options);
</script>

<div>
	<fieldset>
		<legend>{title}</legend>
		<ul class="gap-x-4 px-4 pt-2 [&>*:first-child]:border-t-1">
			{#each options as option}
				<div
					class="border-bg-500 flex w-full flex-row items-center justify-between border-b-1 px-2"
				>
					<label for={`${name}_${option.text}`} class="text-white">
						{option.text}
					</label>
					<input
						{name}
						type="checkbox"
						id={`${name}_${option.text}`}
						bind:group={selected}
						value={option.value}
						class="bg-bg-500 checked:bg-primary h-4 w-4 appearance-none rounded-sm"
					/>
				</div>
			{/each}
		</ul>
	</fieldset>
</div>
