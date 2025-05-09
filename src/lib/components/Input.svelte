<script>
	// let { data } = $props()
	let {
		label,
		type,
		placeholder,
		name,
		value = $bindable(),
		width = 'w-full',
		children,
		list = undefined
	} = $props();
	// let value = $state("")
</script>

<div class="relative flex flex-col">
	<label for={name}>{label}</label>
	<input
		autocomplete="off"
		id="input"
		{list}
		{type}
		bind:value
		{placeholder}
		class="{width} bg-bg-850 border-bg-500 focus:border-primary-light rounded-full border-2 px-6 py-2 outline-0"
	/>
	{#if children}
		{@render children()}
	{/if}
</div>
