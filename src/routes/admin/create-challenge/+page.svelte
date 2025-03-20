<script lang="ts">
	let { data, form } = $props();
	let { translations } = data;
</script>

<div class="mx-auto flex w-1/2 flex-col space-y-2">
	{#if form && form?.success}
		<span class="text-green-600">{translations.success}</span>
	{:else if form && !form?.success}
		<span class="text-red-600">{translations.failure}</span>
	{/if}
	<h2 class="text-xl font-bold">{translations.addnewchallenge}</h2>
	<form method="POST" class="flex flex-col">
		<label for="challenge_id">{translations.challenge_id}</label>
		<input
			class="border border-black"
			type="text"
			name="challenge_id"
			id="challenge_id"
			required
			placeholder="Enter the ID."
		/>
		<label for="display_name">{translations.challenge_display_name}</label>
		<input
			class="border border-black"
			type="text"
			name="display_name"
			id="display_name"
			placeholder="Enter a FIRE 🔥 name."
		/>
		<label for="flag">{translations.flag}</label>
		<input
			class="border border-black"
			type="text"
			name="flag"
			required
			id="flag"
			placeholder="Enter the secret flag 🚩..."
		/>
		<label for="flag_format">{translations.flag_format}</label>
		<input
			class="border border-black"
			type="text"
			name="flag_format"
			id="flag_format"
			placeholder="e.g. myctf&#123;...&#125;"
		/>
		<label for="points">{translations.points}</label>
		<input
			type="number"
			required
			id="points"
			name="points"
			placeholder="Enter the base amount of points."
		/>
		<label for="challenge_category">{translations.challenge_category}</label>
		<select id="challenge_category" name="challenge_category" value="misc">
			{#each ['blockchain', 'crypto', 'forensics', 'introduction', 'misc', 'osint', 'pwn', 'reversing', 'web'] as option}
				<option value={option}>{option}</option>
			{/each}
		</select>
		<button type="submit">Submit</button>
	</form>
</div>
