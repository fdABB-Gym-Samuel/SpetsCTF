<script lang="ts">
	let { data } = $props();
	let { success, message } = data;
</script>

<div class="content">
	<p>{message}</p>
</div>
