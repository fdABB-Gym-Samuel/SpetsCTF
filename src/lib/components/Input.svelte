<script lang="ts">
	import Dropdown from './Dropdown.svelte';

	// let { data } = $props()
	let {
		label,
		type,
		placeholder,
		name,
		value = $bindable(),
		width = 'w-full',
		dropdownData = null
	} = $props();
	// let value = $state("")
	const handleKeyDown = (e: KeyboardEvent) => {
		if (dropdownData) {
			if (e.key === 'ArrowUp') {
				e.preventDefault();
				currentSelected =
					(currentSelected - 1 + dropdownData.results.length) % dropdownData.results.length;
			} else if (e.key === 'ArrowDown') {
				e.preventDefault();
				currentSelected = (currentSelected + 1) % dropdownData.results.length;
			} else if (e.key === 'Enter' && inputFocused) {
				e.preventDefault();
				console.log('rererer');
				dropdownData.onSelect(dropdownData.results[currentSelected].id);
			}
		}
	};
	let inputFocused = $state(false);
	let currentSelected = $state(dropdownData.currentSelected);
</script>

<div class="peer relative flex flex-col">
	<label for={name}>{label}</label>
	<input
		autocomplete="off"
		id="input"
		{type}
		bind:value
		{placeholder}
		class="{width} bg-bg-850 border-bg-500 focus:border-primary-light rounded-full border-2 px-6 py-2 outline-0"
		onkeydown={(e) => handleKeyDown(e)}
		onfocus={() => (inputFocused = true)}
		onblur={() => (inputFocused = false)}
	/>
	{#if dropdownData}
		<Dropdown {...dropdownData} bind:currentSelected></Dropdown>
	{/if}
</div>
