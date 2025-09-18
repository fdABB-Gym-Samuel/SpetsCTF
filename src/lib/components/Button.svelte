<script lang="ts">
	let {
		onClick = undefined,
		label,
		secondLabel = '',
		styleType = 'normal',
		type,
		disabled = false,
		ariaLabel,
		bgColor = 'dark:bg-bg-700',
		disabledBgColor = 'bg-bg-850',
		disabledTextColor = 'text-gradient-100',
		responsiveStyles = '',
		textColor = '',
		hoverColor = 'dark:hover:bg-bg-600 hover:bg-primary-light',
		outlineColor = 'dark:outline-bg-500 outlint-bg-800',
		Icon = undefined,
		iconSize = '16',
		twStyles = '',
		form = undefined
	} = $props();

	if (onClick === undefined && type.toLowerCase() !== 'submit') {
		onClick = () => console.log('No action specified for this button');
	} else if (onClick === undefined) {
		onClick = () => {};
	}
</script>

{#if styleType === 'normal'}
	<button
		{disabled}
		{type}
		onclick={() => onClick()}
		aria-label={ariaLabel}
		class="rounded-xl px-16 py-1.5 my-1 outline-2 {disabled
			? disabledBgColor
			: bgColor} {outlineColor} cursor-pointer {hoverColor} transition-colors *:inline-block {twStyles} {responsiveStyles} text-nowrap"
		{form}
	>
		{#if secondLabel !== ''}
			<span class="mr-0.5 {disabled ? disabledTextColor : textColor}"
				>{label}<span class="text-primary">{secondLabel}</span></span
			>
		{:else}
			<span class="mr-0.5 {disabled ? disabledTextColor : textColor}">{label}</span>
		{/if}
		{#if Icon}
			<Icon
				size={iconSize}
				strokeWidth="2.5"
				class="{disabled ? disabledTextColor : textColor} {secondLabel !== ''
					? 'text-primary'
					: ''}"
			/>
		{/if}
	</button>
{:else if styleType === 'small'}
	<button
		{disabled}
		{type}
		onclick={onClick}
		aria-label={ariaLabel}
		class="rounded-sm px-4 py-1 text-sm {disabled
			? disabledBgColor
			: bgColor} outline-2 {outlineColor} cursor-pointer {hoverColor} transition-colors *:inline-block {responsiveStyles} {twStyles}"
		{form}
	>
		{#if secondLabel !== ''}
			<span class="mr-0.5 {disabled ? disabledTextColor : textColor}"
				>{label}<span class="text-primary-light">{secondLabel}</span></span
			>
		{:else}
			<span class="mr-0.5 {disabled ? disabledTextColor : textColor}">{label}</span>
		{/if}
		{#if Icon}
			<Icon
				size={iconSize}
				strokeWidth="2.5"
				class="{disabled ? disabledTextColor : textColor} {secondLabel !== ''
					? 'text-primary-light'
					: ''}"
			/>
		{/if}
	</button>
{:else if styleType === 'icon'}
	<button
		{disabled}
		{type}
		onclick={() => onClick()}
		aria-label={ariaLabel}
		class="h-fit rounded-sm px-1 py-1 text-left {disabled
			? disabledBgColor
			: bgColor} outline-2 {outlineColor} cursor-pointer {hoverColor} transition-colors *:inline-block {responsiveStyles} {twStyles} flex"
		{form}
	>
		{#if Icon}
			<Icon
				size={iconSize}
				strokeWidth="2.5"
				class="{disabled ? disabledTextColor : textColor} {secondLabel !== ''
					? 'text-primary-light'
					: ''}"
			/>
		{/if}
	</button>
{/if}
