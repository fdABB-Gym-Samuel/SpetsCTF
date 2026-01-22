<script lang="ts">
    let { data } = $props();
    let message = $derived(data.message);
</script>

<div class="content mx-auto w-fit pt-64">
    <p>{message}</p>
</div>
