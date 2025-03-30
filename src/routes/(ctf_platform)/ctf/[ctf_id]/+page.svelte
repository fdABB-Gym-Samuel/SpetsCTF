<script lang="ts">
	import { page } from '$app/state';
	import { readable } from 'svelte/store';

	let { data } = $props();
	let { ctf_data } = data;

 	 // Create a reactive tick store that updates every second.
	  	const time = readable(Date.now(), (set) => {
    		const interval = setInterval(() => {
      			set(Date.now());
    		}, 1000);
    		return () => clearInterval(interval);
  		});

  	let timeToStart = $derived.by(() => {
		if (ctf_data?.start_time !== undefined)
			return ctf_data?.start_time.getTime() - $time
		return 0
	})
  	let timeToEnd = $derived.by(() => {
		if (ctf_data?.end_time !== undefined)
			return ctf_data?.end_time.getTime() - $time
		return 0
	})

</script>

<div class="hero flex h-[var(--hero-height)] w-full flex-col items-center justify-center">
	<div class="flex flex-col items-center gap-2">
		<h1 class="hero-text h-fit text-center max-w-screen font-mono text-4xl sm:text-5xl md:text-7xl">
			{ctf_data?.display_name}
		</h1>
		{#if timeToStart > 0}
		<h3 >CTF Starts in:</h3>

		<div class="countdown flex flex-row max-w-full items-center justify-center gap-2">
			<!-- <p>{t}</p> -->
			<div class="day flex flex-row gap-1 items-center">				
				<h5 class="text-xl">Days:</h5>
				{#each `${Math.floor(timeToStart / (1000*60*60 * 24))}` as daySquare, i}
					<p class="py-3 px-3 bg-stone-500">{`${daySquare}`[i]}</p>
				{/each}
			</div>
			
			<div class="hour flex flex-row gap-1 items-center">
				<h5 class="text-xl">Hours:</h5>
				<p class="py-3 px-3 bg-stone-500">{`${Math.floor(timeToStart / (1000*60*60)) % 24}`.padStart(2, "0")[0]}</p>
				<p class="py-3 px-3 bg-stone-500">{`${Math.floor(timeToStart / (1000*60*60)) % 24}`.padStart(2, "0")[1]}</p>
			</div>

			<div class="hour flex flex-row gap-1 items-center">
				<h5 class="text-xl">Minutes:</h5>

				<p class="py-3 px-3 bg-stone-500">{`${Math.floor(timeToStart / (1000*60)) % 60}`.padStart(2, "0")[0]}</p>
				<p class="py-3 px-3 bg-stone-500">{`${Math.floor(timeToStart / (1000*60)) % 60}`.padStart(2, "0")[1]}</p>
			</div>

			<div class="hour flex flex-row gap-1 items-center">
				<h5 class="text-xl">Seconds:</h5>

				<p class="py-3 px-3 bg-stone-500">{`${Math.floor(timeToStart / (1000)) % 60}`.padStart(2, "0")[0]}</p>
				<p class="py-3 px-3 bg-stone-500">{`${Math.floor(timeToStart / (1000)) % 60}`.padStart(2, "0")[1]}</p>
			</div>
		</div>
		{:else if timeToEnd < 0}
		<h3>CTF has ended!!!</h3>
		<a href={`${page.params.ctf_id}/scoreboard`}>See Results here</a>
		{:else}
		<h3>CTF has started!!!</h3>
		<a href={`${page.params.ctf_id}/challenges`}>See Challenges here</a>
		{/if}

	</div>
</div>
