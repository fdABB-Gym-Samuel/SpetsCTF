<script lang="ts">
	import { resolve } from "$app/paths";
	let { data } = $props();
	let translations = $derived(data.translations)
	let ctfs = $derived(data.ctfs)

	let ongoingCtfs = $derived(
		ctfs.filter((ctf) => {
			const current_time = new Date();
			return ctf.start_time < current_time && current_time < ctf.end_time;
		})
	);
	let upcomingCtfs = $derived(
		ctfs.filter((ctf) => {
			const current_time = new Date();
			return current_time < ctf.start_time;
		})
	);
	let pastCtfs = $derived(
		ctfs.filter((ctf) => {
			const current_time = new Date();
			return ctf.end_time < current_time;
		})
	);
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
		<h1 class="text-3xl font-bold">{translations.ctf_events}</h1>
	</div>
	<section>
		<h3 class="text-2xl">{translations.current_ctfs}</h3>
		{#if ongoingCtfs.length > 0}
			<ul>
				{#each ongoingCtfs as ongoingCtf (ongoingCtf.id)}
					<li
						class="border-primary my-2 flex flex-col justify-between gap-2 rounded-2xl border-2 bg-bg-900 px-2 py-0.5 "
					>
						<a class="ignore-default" href={resolve(`/ctf/${ongoingCtf.id}`)}>
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
		{:else}
			<div class="mt-4 ml-2 flex w-fit flex-row text-gray-500">
				<p class="">
					{translations.nothing_here_yet}
				</p>
			</div>
		{/if}
	</section>
	<section>
		<h3 class="text-2xl">{translations.upcoming_ctfs}</h3>
		{#if upcomingCtfs.length > 0}
			<ul>
				{#each upcomingCtfs as upcomingCtf (upcomingCtf.id)}
					<a class="ignore-default" href={resolve(`/ctf/${upcomingCtf.id}`)}>
						<li
							class="border-primary my-2 flex flex-col justify-between gap-2 rounded-2xl border-2 bg-black px-2 py-0.5"
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
		{:else}
			<div class="mt-4 ml-2 flex w-fit flex-row text-gray-500">
				<p class="">
					{translations.nothing_here_yet}
				</p>
			</div>
		{/if}
	</section>
	<section>
		<h3 class="text-2xl">{translations.past_ctfs}</h3>
		{#if pastCtfs.length > 0}
			<ul>
				{#each pastCtfs as pastCtf (pastCtf.id)}
					<a class="ignore-default" href={resolve(`/ctf/${pastCtf.id}`)}>
						<li
							class="border-primary my-2 flex flex-col justify-between gap-2 rounded-2xl border-2 bg-black px-2 py-0.5"
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
		{:else}
			<div class="mt-4 ml-2 flex w-fit flex-row text-gray-500">
				<p class="">
					{translations.nothing_here_yet}
				</p>
			</div>
		{/if}
	</section>
</div>
