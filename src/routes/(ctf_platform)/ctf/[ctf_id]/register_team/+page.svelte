<script lang="ts">
    let { data } = $props();
    let { translations } = data;
    
</script>

<div class="content">
    <h1 class="route-title">{translations.register_team}</h1>
    <form method="POST" class="flex flex-col">
        <div class="flex flex-col">
            <label for="team_name">{translations.team_name}</label>
            <input type="text" name="team_name" placeholder="🔥 Name">
        </div>
        <div class="flex flex-col">
            <label for="team_website">{translations.team_website}</label>
            <input type="url" placeholder="github.com/fdABB-Gym-Samuel/SpetsCTF">
        </div>
    </form>
</div>