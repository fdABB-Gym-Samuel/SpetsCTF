<script lang="ts">
	let {
		onClick = () => console.log('No action specified for this button'),
		label,
		secondLabel = '',
		styleType = 'normal',
		type,
		ariaLabel,
		bgColor = 'bg-bg-700',
		textColor = '',
		hoverColor = 'hover:bg-bg-600',
		outlineColor = 'outline-bg-500',
		Icon = undefined,
		iconColor = undefined,
		iconSize = '16',
		twStyles = ''
	} = $props();
</script>

{#if styleType === 'normal'}
	<button
		{type}
		onclick={() => onClick()}
		aria-label={ariaLabel}
		class="rounded-xl px-16 py-1.5 {bgColor} outline-2 {outlineColor} cursor-pointer {hoverColor} transition-colors *:inline-block {twStyles}"
	>
		{#if secondLabel !== ''}
			<span class="mr-0.5 {textColor}"
				>{label}<span class="text-primary-light">{secondLabel}</span></span
			>
		{:else}
			<span class="mr-0.5 {textColor}">{label}</span>
		{/if}
		{#if Icon}
			<Icon
				size={iconSize}
				strokeWidth="2.5"
				class={secondLabel !== '' ? 'text-primary-light' : ''}
			/>
		{/if}
	</button>
{:else if styleType === 'action'}
	<button
		{type}
		onclick={() => onClick()}
		aria-label={ariaLabel}
		class="rounded-sm px-1.5 py-1 text-left {bgColor} outline-2 {outlineColor} cursor-pointer {hoverColor} transition-colors *:inline-block {twStyles}"
	>
		{#if Icon}
			<Icon
				size={iconSize}
				strokeWidth="2.5"
				class="{textColor} {secondLabel !== '' ? 'text-primary-light' : ''}"
			/>
		{/if}
	</button>
{/if}
