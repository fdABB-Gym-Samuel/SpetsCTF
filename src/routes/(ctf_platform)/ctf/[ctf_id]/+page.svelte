<script lang="ts">
    let { data } = $props()
    let { ctf_data } = data
    console.log(ctf_data)
</script>

<div class="hero flex h-[var(--hero-height)] w-full flex-col items-center justify-center">
    <div class="flex flex-row items-center gap-2">
		<h1 class="hero-text h-fit text-center font-mono text-4xl sm:text-5xl md:text-7xl">{ctf_data?.display_name}</h1>
	</div>

</div>