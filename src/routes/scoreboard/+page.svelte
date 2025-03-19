<script>
	import Scoreboard from '../../components/scoreboard.svelte';
</script>

<div class="mx-[var(--main-padding-inline)]">
	<h1 class="route-title">Scoreboards</h1>
	<div class="flex max-w-screen min-w-fit flex-row flex-wrap items-end justify-stretch gap-10">
		<div class="user-leaderboard max-w-screen min-w-fit flex-1">
			<Scoreboard title="Users" type="users"></Scoreboard>
		</div>
		<div class="class-leaderboard max-w-screen min-w-fit flex-1">
			<Scoreboard title="Classes" type="classes"></Scoreboard>
		</div>
	</div>
</div>
