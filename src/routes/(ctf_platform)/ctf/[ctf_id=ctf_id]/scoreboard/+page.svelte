<script lang="ts">
	let { data } = $props();
	let { scores } = data;
</script>

<div class="content">
	<ol>
		{#each scores as score}
			<p>{score.team_name} - {score.total_points}</p>
		{/each}
	</ol>
</div>
