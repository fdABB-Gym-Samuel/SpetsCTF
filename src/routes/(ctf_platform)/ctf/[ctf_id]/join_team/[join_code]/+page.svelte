<script lang="ts">
    let { data } = $props()
    let { success, message } = data
    console.log(message)
</script>

<div class="content">
    <p>{message}</p>
</div>