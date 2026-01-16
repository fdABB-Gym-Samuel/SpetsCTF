<script lang="ts">
    import type { Icon as IconType } from '@lucide/svelte';
    import type { HTMLButtonAttributes } from 'svelte/elements';

    interface Props extends HTMLButtonAttributes {
        Icon?: typeof IconType;
        bgColor?: string;
        disabledBgColor?: string;
        disabledTextColor?: string;
        hoverColor?: string;
        iconSize?: string;
        label: string;
        outlineColor?: string;
        responsiveStyles?: string;
        secondLabel?: string;
        styleType?: 'normal' | 'small' | 'icon';
        textColor?: string;
        twStyles?: string;
    }

    let {
        Icon = undefined,
        bgColor = 'bg-bg-700',
        disabled,
        disabledBgColor = 'bg-bg-850',
        disabledTextColor = 'text-gradient-100',
        hoverColor = 'hover:bg-bg-600',
        iconSize = '16',
        label,
        outlineColor = 'outline-bg-500',
        responsiveStyles = '',
        secondLabel = '',
        styleType = 'normal',
        textColor = '',
        twStyles = '',
        ...restProps
    }: Props = $props();
</script>

{#if styleType === 'normal'}
    <button
        {...restProps}
        class="rounded-xl px-16 py-1.5 outline-2 {disabled
            ? disabledBgColor
            : bgColor} {outlineColor} cursor-pointer {hoverColor} transition-colors *:inline-block {twStyles} {responsiveStyles} text-nowrap">
        {#if secondLabel !== ''}
            <span class="mr-0.5 {disabled ? disabledTextColor : textColor}"
                >{label}<span class="dark:text-primary-light text-primary"
                    >{secondLabel}</span
                ></span>
        {:else}
            <span class="mr-0.5 {disabled ? disabledTextColor : textColor}"
                >{label}</span>
        {/if}
        {#if Icon}
            <Icon
                size={iconSize}
                strokeWidth="2.5"
                class="{disabled ? disabledTextColor : textColor} {secondLabel !== ''
                    ? 'dark:text-primary-light text-primary'
                    : ''}" />
        {/if}
    </button>
{:else if styleType === 'small'}
    <button
        {...restProps}
        class="rounded-sm px-4 py-1 text-sm {disabled
            ? disabledBgColor
            : bgColor} outline-2 {outlineColor} cursor-pointer {hoverColor} transition-colors *:inline-block {responsiveStyles} {twStyles}">
        {#if secondLabel !== ''}
            <span class="mr-0.5 {disabled ? disabledTextColor : textColor}"
                >{label}<span class="text-primary-light">{secondLabel}</span></span>
        {:else}
            <span class="mr-0.5 {disabled ? disabledTextColor : textColor}"
                >{label}</span>
        {/if}
        {#if Icon}
            <Icon
                size={iconSize}
                strokeWidth="2.5"
                class="{disabled ? disabledTextColor : textColor} {secondLabel !== ''
                    ? 'text-primary-light'
                    : ''}" />
        {/if}
    </button>
{:else if styleType === 'icon'}
    <button
        {...restProps}
        class="h-fit rounded-sm px-1 py-1 text-left {disabled
            ? disabledBgColor
            : bgColor} outline-2 {outlineColor} cursor-pointer {hoverColor} transition-colors *:inline-block {responsiveStyles} {twStyles} flex">
        {#if Icon}
            <Icon
                size={iconSize}
                strokeWidth="2.5"
                class="{disabled ? disabledTextColor : textColor} {secondLabel !== ''
                    ? 'text-primary-light'
                    : ''}" />
        {/if}
    </button>
{/if}
