<script lang="ts">
    import { page } from '$app/state'
    let { data } = $props()
    let { error } = data
    console.log(page.status)
</script>


<div class="content flex flex-row justify-center items-center">
    <div class="block -rotate-90 absolute left-0">
        <a href="/what-is-this-a-secret-challenge?" class="ignore-default text-background-dark cursor-help select-none">or is there</a>
    </div>
    <div class="flex flex-col justify-center items-center">
        <h1 class="ignore-default text-center text-9xl">{page.status}</h1>
        {#if page.status === 404}
        <h3 class="ignore-default text-center">No flag here, nor is there a page?</h3>
        <img 
            src="no_flag_no_page.png" 
            alt='Super cool "No Flag, No Page" image' 
            class="object-contain max-h-120"
            onclick={() => {window.location.href = "/super_great_artist"}}>
        <form class="text-center" action="/api/submit/super_secret_super_flag_challenge_that_no_one_knows_about">
            <label for="">But one can always try:</label>
            <input type="text" name="flag" class="bg-foreground-dark text-background-dark pl-2" placeholder="???">
            <button type="submit" class="ignore-default bg-button-dark mt-2 text-sm py-0 w-full border-2 rounded-md"> Submit flag that may or may not exist</button>
        </form>
        {/if}
    </div>
</div>