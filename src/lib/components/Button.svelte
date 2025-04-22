<script lang="ts">
  let {
    onClick = () => console.log("No action specified for this button"),
    label,
    secondLabel = "",
    styleType = "normal",
    type,
    ariaLabel,
    bgColor = "bg-bg-700",
    hoverColor = "hover:bg-bg-600",
    outlineColor = "outline-bg-500",
    Icon = undefined,
    iconSize = "16",
    twStyles = ""
  } = $props();
</script>

{#if styleType === "normal"}
  <button type={type} onclick={() => onClick()} aria-label={ariaLabel} class="px-16 py-1.5 rounded-xl {bgColor} outline-2 {outlineColor} cursor-pointer {hoverColor} transition-colors *:inline-block {twStyles}">
    {#if secondLabel !== ""}
      <span class="mr-0.5">{label}<span class="text-primary-light">{secondLabel}</span></span>
    {:else}
      <span class="mr-0.5">{label}</span>
    {/if}
    {#if Icon}
      <Icon size={iconSize} strokeWidth="2.5" class={secondLabel !== "" ? "text-primary-light" : ""} />
    {/if}
  </button>
{/if}
