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
	const months: string[] = [
		translations.jan,
		translations.feb,
		translations.mar,
		translations.apr,
		translations.may,
		translations.jun,
		translations.jul,
		translations.aug,
		translations.sep,
		translations.oct,
		translations.nov,
		translations.dec
	]; // the index of the month becomes the index of the translation
</script>

<div class="content flex flex-col gap-5">
	<div>
		<h1 class="route-title">{translations.ctf_events}</h1>
		<p>{translations.to_play_ctf_is_a}</p>
	</div>
	<section>
		<h3 class="text-2xl">{translations.current_ctfs}</h3>
		<ul>
			{#each ongoingCtfs as ongoingCtf}
				<li
					class="border-accent-light dark:border-accent-dark my-2 flex flex-col justify-between gap-2 rounded-2xl border-2 bg-white px-2 py-0.5 dark:bg-black"
				>
					<a class="ignore-default" href={`/ctf/${ongoingCtf.id}`}>
						<h5>{ongoingCtf.display_name}</h5>
						<div class="flex flex-row gap-2">
							<span
								><strong>{translations.from}:</strong>
								{ongoingCtf.start_time.getDate()}
								{months[ongoingCtf.start_time.getMonth()]}
								{ongoingCtf.start_time.getFullYear()}
								{ongoingCtf.start_time.getHours()}:{ongoingCtf.start_time
									.getMinutes()
									.toString()
									.padStart(2, '0')}</span
							>
							<span
								><strong>{translations.to}:</strong>
								{ongoingCtf.end_time.getDate()}
								{months[ongoingCtf.end_time.getMonth()]}
								{ongoingCtf.start_time.getFullYear()}
								{ongoingCtf.end_time.getHours()}:{ongoingCtf.end_time
									.getMinutes()
									.toString()
									.padStart(2, '0')}</span
							>
						</div>
					</a>
				</li>
			{/each}
		</ul>
	</section>
	<!-- <hr /> -->
	<section>
		<h3 class="text-2xl">{translations.upcoming_ctfs}</h3>
		<ul>
			{#each upcomingCtfs as upcomingCtf}
				<a class="ignore-default" href={`/ctf/${upcomingCtf.id}`}>
					<li
						class="border-accent-light dark:border-accent-dark my-2 flex flex-col justify-between gap-2 rounded-2xl border-2 bg-black px-2 py-0.5"
					>
						<h5>{upcomingCtf.display_name}</h5>
						<div class="flex flex-row gap-2">
							<span class="block"
								><strong>{translations.from}:</strong>
								{upcomingCtf.start_time.getDate()}
								{months[upcomingCtf.start_time.getMonth()]}
								{upcomingCtf.start_time.getFullYear()}
								{upcomingCtf.start_time.getHours()}:{upcomingCtf.start_time
									.getMinutes()
									.toString()
									.padStart(2, '0')}</span
							>
							<span class="block"
								><strong>{translations.to}:</strong>
								{upcomingCtf.end_time.getDate()}
								{months[upcomingCtf.end_time.getMonth()]}
								{upcomingCtf.end_time.getFullYear()}
								{upcomingCtf.end_time.getHours()}:{upcomingCtf.end_time
									.getMinutes()
									.toString()
									.padStart(2, '0')}</span
							>
						</div>
					</li>
				</a>
			{/each}
		</ul>
	</section>
	<section>
		<h3 class="text-2xl">{translations.past_ctfs}</h3>
		<ul>
			{#each pastCtfs as pastCtf}
				<a class="ignore-default" href={`/ctf/${pastCtf.id}`}>
					<li
						class="border-accent-light dark:border-accent-dark my-2 flex flex-col justify-between gap-2 rounded-2xl border-2 bg-black px-2 py-0.5"
					>
						<h5>{pastCtf.display_name}</h5>
						<div class="flex flex-row gap-2">
							<span class="block"
								><strong>{translations.from}:</strong>
								{pastCtf.start_time.getDate()}
								{months[pastCtf.start_time.getMonth()]}
								{pastCtf.start_time.getFullYear()}
								{pastCtf.start_time.getHours()}:{pastCtf.start_time
									.getMinutes()
									.toString()
									.padStart(2, '0')}</span
							>
							<span class="block"
								><strong>{translations.to}:</strong>
								{pastCtf.end_time.getDate()}
								{months[pastCtf.end_time.getMonth()]}
								{pastCtf.start_time.getFullYear()}
								{pastCtf.end_time.getHours()}:{pastCtf.end_time
									.getMinutes()
									.toString()
									.padStart(2, '0')}</span
							>
						</div>
					</li>
				</a>
			{/each}
		</ul>
	</section>
</div>
