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
        outlineColor?: string;
        responsiveStyles?: string;
        secondLabel?: string;
        styleType?: 'normal' | 'small' | 'icon';
        textColor?: string;
        twStyles?: string;
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
        ...restProps
    }: Props = $props();
</script>

{#if styleType === 'normal'}
    <button
        {disabled}
        {...restProps}
        class="flex items-center gap-1.5 rounded-lg px-5 py-2.5 font-semibold {disabled
            ? disabledBgColor
            : bgColor} cursor-pointer {hoverColor} transition-colors *:inline-block {twStyles} {responsiveStyles} text-nowrap">
        {#if secondLabel !== ''}
            <span class={disabled ? disabledTextColor : textColor}
                >{label}<span class="dark:text-primary-light text-primary"
                    >{secondLabel}</span
                ></span>
        {:else}
            <span class={disabled ? disabledTextColor : textColor}>{label}</span>
        {/if}
        {#if Icon}
            <Icon
                class="inline-block {disabled
                    ? disabledTextColor
                    : textColor} {secondLabel !== ''
                    ? 'dark:text-primary-light text-primary'
                    : ''}"
                style="font-size: {iconSize}" />
        {/if}
    </button>
{:else if styleType === 'small'}
    <button
        {...restProps}
        class="rounded-sm px-4 py-1 text-sm {disabled
            ? disabledBgColor
            : bgColor} cursor-pointer outline-2 {hoverColor} transition-colors *:inline-block {responsiveStyles} {twStyles}">
        {#if secondLabel !== ''}
            <span class="mr-1 {disabled ? disabledTextColor : textColor}"
                >{label}<span class="text-primary-light">{secondLabel}</span></span>
        {:else}
            <span class="mr-1 {disabled ? disabledTextColor : textColor}">{label}</span>
        {/if}
        {#if Icon}
            <Icon
                class="inline-block {disabled
                    ? disabledTextColor
                    : textColor} {secondLabel !== ''
                    ? 'dark:text-primary-light text-primary'
                    : ''}"
                style="font-size: {iconSize}" />
        {/if}
    </button>
{:else if styleType === 'icon'}
    <button
        {...restProps}
        class="h-fit rounded-sm p-2 text-left {disabled
            ? disabledBgColor
            : bgColor} cursor-pointer {hoverColor} transition-colors *:inline-block {responsiveStyles} {twStyles} flex">
        {#if Icon}
            <Icon
                class="inline-block {disabled
                    ? disabledTextColor
                    : textColor} {secondLabel !== ''
                    ? 'dark:text-primary-light text-primary'
                    : ''}"
                style="font-size: {iconSize}" />
        {/if}
    </button>
{/if}
