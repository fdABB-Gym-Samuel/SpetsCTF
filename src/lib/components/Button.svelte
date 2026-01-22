<script lang="ts">
    import type { Component } from 'svelte';
    import type { HTMLButtonAttributes } from 'svelte/elements';
    interface Props extends HTMLButtonAttributes {
        Icon?: Component;
        bgColor?: string;
        disabledBgColor?: string;
        disabledTextColor?: string;
        hoverColor?: string;
        iconSize?: string;
        label: string;
        responsiveStyles?: string;
        secondLabel?: string;
        styleType?: 'normal' | 'icon';
        textColor?: string;
        twStyles?: string;
        inverted?: boolean;
    }
    let {
        Icon = undefined,
        bgColor = 'bg-bg-800',
        disabled,
        disabledBgColor = 'bg-bg-850',
        disabledTextColor = 'text-text-200',
        hoverColor = 'hover:bg-bg-700',
        iconSize = '20px',
        label,
        responsiveStyles = '',
        secondLabel = '',
        styleType = 'normal',
        textColor = 'text-text-150',
        twStyles = '',
        inverted = false,
        ...restProps
    }: Props = $props();

    const invertedBgColor = $derived(inverted ? 'bg-bg-100' : bgColor);
    const invertedHoverColor = $derived(inverted ? 'hover:bg-bg-200' : hoverColor);
    const invertedTextColor = $derived(inverted ? 'text-bg-600' : textColor);
</script>

{#if styleType === 'normal'}
    <button
        {disabled}
        {...restProps}
        class="flex items-center gap-1.5 rounded-lg px-5 py-2.5 font-semibold {disabled
            ? disabledBgColor
            : invertedBgColor} cursor-pointer {disabled
            ? ''
            : invertedHoverColor} transition-colors *:inline-block {twStyles} {responsiveStyles} text-nowrap">
        {#if secondLabel !== ''}
            <span class={disabled ? disabledTextColor : invertedTextColor}
                >{label}<span class="dark:text-primary-light text-primary"
                    >{secondLabel}</span
                ></span>
        {:else}
            <span class={disabled ? disabledTextColor : invertedTextColor}
                >{label}</span>
        {/if}
        {#if Icon}
            <Icon
                class="inline-block {disabled
                    ? disabledTextColor
                    : invertedTextColor} {secondLabel !== ''
                    ? 'dark:text-primary-light text-primary'
                    : ''}"
                style="font-size: {iconSize}px" />
        {/if}
    </button>
{:else if styleType === 'icon'}
    <button
        {...restProps}
        class="h-fit rounded-sm p-2 text-left {disabled
            ? disabledBgColor
            : invertedBgColor} cursor-pointer {disabled
            ? ''
            : invertedHoverColor} transition-colors *:inline-block {responsiveStyles} {twStyles} flex">
        {#if Icon}
            <Icon
                class="inline-block {disabled
                    ? disabledTextColor
                    : invertedTextColor} {secondLabel !== ''
                    ? 'dark:text-primary-light text-primary'
                    : ''}"
                style="font-size: {iconSize}px" />
        {/if}
    </button>
{/if}
