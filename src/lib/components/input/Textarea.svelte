<script lang="ts">
	import { onMount } from 'svelte';

	let {
		label,
		placeholder,
		name,
		value = $bindable(),
		textareaFocused = $bindable(false),
		width = 'w-full',
		heightStyles = 'max-h-50',
		rows = 2,
		required = false
	} = $props();

	const handleInput = () => {
		if (textareaElement === undefined) {
			return;
		}
		textareaElement.style.height = 'auto';
		textareaElement.style.height = `${textareaElement?.scrollHeight}px`;
	};
	let textareaElement: HTMLTextAreaElement | undefined;

	onMount(() => {
		textareaFocused = textareaElement === document.activeElement;
	});
</script>

<div class="relative flex flex-col">
	<div>
		<label for={name}>
			<span>{label}</span>

			{#if required}
				<span class="text-primary-light">*</span>
			{/if}
		</label>
	</div>
	<textarea
		bind:this={textareaElement}
		{name}
		autocomplete="off"
		id="input"
		bind:value
		{placeholder}
		class="{width} bg-bg-850 border-bg-500 focus:border-primary-light rounded-lg border-2 px-6 py-2 outline-0 {heightStyles}"
		{rows}
		onfocus={() => (textareaFocused = true)}
		onblur={(e) => (textareaFocused = false)}
		oninput={() => handleInput()}
		{required}
	></textarea>
</div>
