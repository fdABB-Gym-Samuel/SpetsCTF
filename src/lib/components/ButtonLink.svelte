<script lang="ts">
    import type { Icon as IconType } from '@lucide/svelte';
    import type { HTMLAnchorAttributes } from 'svelte/elements';

    interface Props extends HTMLAnchorAttributes {
        Icon?: typeof IconType;
        bgColor?: string;
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
        label,
        secondLabel = '',
        styleType = 'normal',
        bgColor = 'bg-bg-700',
        responsiveStyles = '',
        textColor = '',
        hoverColor = 'hover:bg-bg-600',
        outlineColor = 'outline-bg-500',
        Icon = undefined,
        iconSize = '16',
        twStyles = '',
        ...restProps
    }: Props = $props();
</script>

{#if styleType === 'normal'}
    <a
        {...restProps}
        class="rounded-xl px-16 py-1.5 outline-2 {bgColor} {outlineColor} cursor-pointer {hoverColor} transition-colors *:inline-block {twStyles} {responsiveStyles} text-nowrap">
        {#if secondLabel !== ''}
            <span class="mr-0.5 {textColor}"
                >{label}<span class="dark:text-primary-light text-primary"
                    >{secondLabel}</span
                ></span>
        {:else}
            <span class="mr-0.5 {textColor}">{label}</span>
        {/if}
        {#if Icon}
            <Icon
                size={iconSize}
                strokeWidth="2.5"
                class="{textColor} {secondLabel !== ''
                    ? 'dark:text-primary-light text-primary'
                    : ''}" />
        {/if}
    </a>
{:else if styleType === 'small'}
    <a
        {...restProps}
        class="rounded-sm px-4 py-1 text-sm {bgColor} outline-2 {outlineColor} cursor-pointer {hoverColor} transition-colors *:inline-block {responsiveStyles} {twStyles}">
        {#if secondLabel !== ''}
            <span class="mr-0.5 {textColor}"
                >{label}<span class="text-primary-light">{secondLabel}</span></span>
        {:else}
            <span class="mr-0.5 {textColor}">{label}</span>
        {/if}
        {#if Icon}
            <Icon
                size={iconSize}
                strokeWidth="2.5"
                class="{textColor} {secondLabel !== '' ? 'text-primary-light' : ''}" />
        {/if}
    </a>
{:else if styleType === 'icon'}
    <a
        {...restProps}
        class="h-fit rounded-sm px-1 py-1 text-left {bgColor} outline-2 {outlineColor} cursor-pointer {hoverColor} transition-colors *:inline-block {responsiveStyles} {twStyles} flex">
        {#if Icon}
            <Icon
                size={iconSize}
                strokeWidth="2.5"
                class="{textColor} {secondLabel !== '' ? 'text-primary-light' : ''}" />
        {/if}
    </a>
{/if}
