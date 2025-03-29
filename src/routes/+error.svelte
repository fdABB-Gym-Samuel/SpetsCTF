<script lang="ts">
	import '../app.css';
	import Navbar from '$lib/components/navbar.svelte';
	import { page } from '$app/state';
	import { enhance } from '$app/forms';

	let { data } = $props();
	let { user, translations } = data;

	const links = [
		{ display: 'Challenges', href: '/challenges' },
		{ display: 'CTFs', href: `/ctfs` },
		{ display: 'Leaderboard', href: `/scoreboard` },
		{ display: 'About', href: `/about` }
	];
</script>

<Navbar {links} {translations} {user}></Navbar>

<main
	class="bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark flex min-h-[var(--main-height)] w-screen flex-col items-stretch py-[var(--nav-height)]"
>
	<div class="content flex flex-row items-center justify-center">
		<div class="absolute left-0 block -rotate-90">
			<a
				href="/what_is_this_a_secret_challenge?"
				class="ignore-default text-background-light dark:text-background-dark cursor-help select-none"
				>or is there</a
			>
		</div>
		<div class="flex flex-col items-center justify-center">
			<h1 class="ignore-default text-center font-mono text-9xl">{page.status}</h1>
			{#if page.status === 404}
				<h3 class="ignore-default text-center">No flag here, nor is there a page?</h3>
				<a href="/super_great_artist">
					<img
						src="/no_flag_no_page.png"
						alt="Super cool 'No Flag, No Page'"
						class="max-h-120 object-contain"
					/>
				</a>
				<form
					class="text-center"
					action="/api/submit/super_secret_super_flag_challenge_that_no_one_knows_about"
					use:enhance
				>
					<label for="">But one can always try:</label>
					<input
						type="text"
						name="flag"
						class="bg-foreground-light dark:bg-foreground-dark text-background-light dark:text-background-dark pl-2"
						placeholder="???"
					/>
					<button
						type="submit"
						class="ignore-default bg-button-light dark:bg-button-dark mt-2 w-full rounded-md border-2 py-0 text-sm"
					>
						Submit flag that may or may not exist</button
					>
				</form>
			{/if}
		</div>
	</div>
</main>
