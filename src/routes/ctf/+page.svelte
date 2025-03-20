<script lang="ts">
	let { data } = $props();
	let { translations, ctfs } = data;

	let ongoingCtfs = $derived(
		ctfs.filter((ctf) => {
			const current_time = new Date();
			return ctf.start_time < current_time && current_time < ctf.end_time;
		})
	);
	$inspect(ongoingCtfs);
	let upcomingCtfs = $derived(
		ctfs.filter((ctf) => {
			const current_time = new Date();
			return current_time < ctf.start_time;
		})
	);
	$inspect(upcomingCtfs);
	let pastCtfs = $derived(
		ctfs.filter((ctf) => {
			const current_time = new Date();
			return ctf.end_time < current_time;
		})
	);
	$inspect(pastCtfs);
</script>

<div>
	<h1>{translations.ctf_events}</h1>
	<p>{translations.to_play_ctf_is_a}</p>
	<section>
		<h2>{translations.current_ctfs}</h2>
		{#each ongoingCtfs as ongoingCtf}
			<h3>{ongoingCtf.display_name}</h3>
			<span
				>{translations.start_date}
				{ongoingCtf.start_time.toLocaleDateString()}
				{ongoingCtf.start_time.toLocaleTimeString()}</span
			>
			<span
				>{translations.end_date}
				{ongoingCtf.end_time.toLocaleDateString()}
				{ongoingCtf.end_time.toLocaleTimeString()}</span
			>
		{/each}
	</section>
	<hr />
	<section>
		<h2>{translations.upcoming_ctfs}</h2>
		{#each upcomingCtfs as upcomingCtf}
			<h3>{upcomingCtf.display_name}</h3>
			<span
				>{translations.start_date}
				{upcomingCtf.start_time.toLocaleDateString()}
				{upcomingCtf.start_time.toLocaleTimeString()}</span
			>
			<span
				>{translations.end_date}
				{upcomingCtf.end_time.toLocaleDateString()}
				{upcomingCtf.end_time.toLocaleTimeString()}</span
			>
		{/each}
	</section>
	<hr />
	<section>
		<h2>{translations.past_ctfs}</h2>
		{#each pastCtfs as pastCtf}
			<h3>{pastCtf.display_name}</h3>
			<span
				>{translations.start_date}
				{pastCtf.start_time.toLocaleDateString()}
				{pastCtf.start_time.toLocaleTimeString()}</span
			>
			<span
				>{translations.end_date}
				{pastCtf.end_time.toLocaleDateString()}
				{pastCtf.end_time.toLocaleTimeString()}</span
			>
		{/each}
	</section>
</div>
