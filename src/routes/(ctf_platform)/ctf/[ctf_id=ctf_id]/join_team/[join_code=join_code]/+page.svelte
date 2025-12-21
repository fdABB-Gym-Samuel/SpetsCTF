<script lang="ts">
	let { data } = $props();
	let message = $derived(data.message);
</script>

<div class="content">
	<p>{message}</p>
</div>
