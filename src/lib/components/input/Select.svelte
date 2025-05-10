<script lang="ts">
	let { label, name, id, options, value = $bindable() } = $props();
</script>

<div class="flex w-6/10 flex-col">
	<label for={name}>{label}</label>

	<select
		{name}
		{id}
		class="bg-bg-700 border-bg-500 focus:border-primary-light w-full rounded-full border-2 px-6 py-2"
		bind:value
	>
		{#each options as option}
			<option value={option.value}>{option.text}</option>
		{/each}
	</select>
</div>
