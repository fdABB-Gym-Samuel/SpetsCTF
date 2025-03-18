<script lang="ts">
	import { Category } from '$lib/db/schema';

	let { data, form } = $props();
	let { challs, translations } = data;
</script>

<div class="mx-auto flex w-1/2 flex-col space-y-2">
	{#if form && form?.success}
		<span class="text-green-600">Success</span>
	{:else if form && !form?.success}
		<span class="text-red-600">Failure</span>
	{/if}
	<h2 class="text-xl font-bold">Challs</h2>
	<div class="flex flex-col space-y-2">
		{#each challs as chall}
			<div class="rounded border border-black p-2">
				<h3 class="text-lg font-bold">{chall.challenge_id}</h3>
				<span>{chall.challenge_category}</span>
				<span>{chall.points}</span>
			</div>
		{/each}
	</div>
	<h2 class="text-xl font-bold">Add new chall</h2>
	<form method="POST" class="flex flex-col">
		<label for="challenge_id">Challenge ID</label>
		<input
			class="border border-black"
			type="text"
			name="challenge_id"
			id="challenge_id"
			required
			placeholder="Enter the ID."
		/>
		<label for="display_name">Challenge Display Name</label>
		<input
			class="border border-black"
			type="text"
			name="display_name"
			id="display_name"
			placeholder="Enter a FIRE 🔥 name."
		/>
		<label for="flag">Flag</label>
		<input
			class="border border-black"
			type="text"
			name="flag"
			required
			id="flag"
			placeholder="Enter the secret flag 🚩..."
		/>
		<label for="flag_format">Flag format</label>
		<input
			class="border border-black"
			type="text"
			name="flag_format"
			id="flag_format"
			placeholder="e.g. myctf&#123;...&#125;"
		/>
		<label for="points">Points</label>
		<input
			type="number"
			required
			id="points"
			name="points"
			placeholder="Enter the base amount of points."
		/>
		<label for="challenge_category">Challenge Category</label>
		<select id="challenge_category" name="challenge_category" value={Category.misc}>
			{#each Object.values(Category) as option}
				<option value={option}>{option}</option>
			{/each}
		</select>
		<button type="submit">Submit</button>
	</form>
</div>
