<script>
    import Scoreboard from "../../components/scoreboard.svelte";

</script>

<div class="w-full flex flex-row flex-wrap justify-center items-end gap-10 px-10">
    <div class="user-leaderboard min-w-4/10 max-w-full">
        <Scoreboard title="Users" type="users"></Scoreboard>
    </div>
    <div class="class-leaderboard min-w-4/10">
        <Scoreboard title="Classes" type="classes"></Scoreboard>
    </div>
</div>