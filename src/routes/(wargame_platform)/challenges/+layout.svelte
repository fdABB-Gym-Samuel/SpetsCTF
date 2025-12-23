<script lang="ts">
  import {goto} from "$app/navigation";
  import {page} from "$app/state";
  import {resolve} from "$app/paths";

  let { children } = $props();

  function closeModal() {
    goto(resolve('/challenges'))
  }

  function handleOverlayClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      closeModal();
    }
  }
</script>

<div class="layout">
  {@render children()}
</div>

{#if page.params.challengeId}
  <div
    class="modal-overlay"
    onclick={handleOverlayClick}
    role="dialog"
    aria-modal={true}
    tabindex="0"
  >
    <div class="modal-content" onclick={(e) => e.stopPropagation()}>
      {@render children()}
    </div>
  </div>

{/if}

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(2px);
  }
  
  .modal-content {
    position: relative;
    background: var(--color-bg-900, #1a1a1a);
    border-radius: 8px;
    max-width: 90vw;
    max-height: 90vh;
    overflow-y: auto;
  }
</style>
