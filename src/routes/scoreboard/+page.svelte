<script>
    import Scoreboard from "../../components/scoreboard.svelte";

</script>

<div class="mx-[var(--main-padding-inline)]">
    <h1 class="route-title">Scoreboards</h1>
    <div class="min-w-fit max-w-screen flex flex-row flex-wrap justify-stretch items-end gap-10">
        <div class="user-leaderboard flex-1 min-w-fit max-w-screen">
            <Scoreboard title="Users" type="users"></Scoreboard>
        </div>
        <div class="class-leaderboard flex-1 min-w-fit max-w-screen">
            <Scoreboard title="Classes" type="classes"></Scoreboard>
        </div>
    </div>
</div>