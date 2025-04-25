<script lang="ts">
	let { data } = $props();
	let { translations } = data;

	import { Brain } from '@lucide/svelte';

	import { onMount, onDestroy } from 'svelte';
	import gsap from 'gsap';
	import { goto } from '$app/navigation';

	import { playAnimations } from '$lib/gsap/animations';

	import HSeperator from '$lib/components/HSeperator.svelte';
	import Button from '$lib/components/Button.svelte';
	import type { H } from 'vitest/dist/chunks/environment.d8YfPkTm.js';

	const targetDate = new Date('2025-12-01T12:00:00Z');

	let countdown = $state({ days: 0, hours: 0, minutes: 0, seconds: 0 });

	type Timeout = ReturnType<typeof setInterval>;
	let interval: Timeout;

	function updateCountdown(): void {
		const now = new Date();
		const diff = targetDate.getTime() - now.getTime();

		if (diff <= 0) {
			countdown = { days: 0, hours: 0, minutes: 0, seconds: 0 };
			clearInterval(interval);
			return;
		}

		const totalSeconds = Math.floor(diff / 1000);
		const days = Math.floor(totalSeconds / (3600 * 24));
		const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);
		const seconds = totalSeconds % 60;

		countdown = { days, hours, minutes, seconds };
	}

	let componentRoot: HTMLElement;
	let gsapContext: gsap.Context | undefined;

	let countdownContainer: HTMLElement;
	const maxRotate: number = 1.5;

	function handleMouseMove(event: MouseEvent): void {
		const rect = countdownContainer.getBoundingClientRect();
		const xRel = event.clientX - (rect.left + rect.width / 2);
		const yRel = event.clientY - (rect.top + rect.height / 2);

		// Normalize to range [-1, 1]
		const xNorm = xRel / (rect.width / 2);
		const yNorm = yRel / (rect.height / 2);

		const rotY = xNorm * maxRotate; // mouse right → positive Y-rotation
		const rotX = -yNorm * maxRotate; // mouse down → positive X-rotation

		// Smoothly tween to the new rotation
		gsap.to(countdownContainer, {
			rotationX: rotX,
			rotationY: rotY,
			duration: 0.5
		});
	}

	function handleMouseLeave() {
		// reset back to flat
		gsap.to(countdownContainer, {
			rotationX: 0,
			rotationY: 0,
			duration: 0.5
		});
	}

	onMount(() => {
		updateCountdown();
		interval = setInterval(updateCountdown, 1000);

		gsapContext = playAnimations(componentRoot);
	});

	onDestroy(() => {
		clearInterval(interval);

		gsapContext?.revert();
	});
</script>

<svelte:body on:mousemove={handleMouseMove} on:mouseleave={handleMouseLeave} />

<main
	class="m-auto flex max-w-[520px] flex-col items-center justify-center pt-48"
	bind:this={componentRoot}
>
	<header class="gsap-top-down-opacity">
		<img src="/assets/logo.svg" alt="SpetsCTF" class="select-none" />
	</header>
	<div class="mt-8">
		<h2 class="gsap-top-down-opacity">Who are we?</h2>
		<p class="gsap-top-down-opacity">
			SpetsCTF is a CTF and wargames platform. You can play <a
				href="/challenges"
				class="text-primary-light underline">Challenges</a
			>
			or join <a href="/ctfs" class="text-primary-light underline">SpetsCTF</a> when it is time.
		</p>
	</div>
	<div class="w-full perspective-midrange">
		<article
			bind:this={countdownContainer}
			class="gsap-opacity-slow mt-12 w-full will-change-transform transform-3d"
		>
			<p class="text-text-200 mb-2 text-sm">Next SpetsCTF is in</p>
			<div class="rounded-lg shadow-xl">
				<div
					class="bg-bg-800 inner-shadow flex items-center justify-between rounded-lg px-10 py-2 pb-3 select-none"
				>
					{#each Object.entries(countdown) as [label, number], index}
						<div class="flex flex-col items-center">
							<p class="-mb-2 flex-1 text-center text-lg">{number}</p>
							<p class="text-text-200 text-sm">{label}</p>
						</div>
						{#if index !== Object.entries(countdown).length - 1}
							<div class="h-5">
								<HSeperator color="bg-bg-600" />
							</div>
						{/if}
					{/each}
				</div>
			</div>
		</article>
	</div>

	<div class="gsap-bottom-up-opacity mt-24">
		<Button
			label="Start practicing"
			type="button"
			onClick={() => goto('/challenges')}
			Icon={Brain}
			ariaLabel="Go to challenges"
		/>
	</div>
</main>

<!--
<header class="hero flex h-[var(--hero-height)] w-full flex-col items-center justify-center">
	<div class="flex flex-row items-center gap-2">
		<img src="/logo.svg" alt="" class="logo w-20" />
		<h1 class="hero-text h-fit text-center font-mono text-5xl sm:text-6xl md:text-8xl">SpetsCTF</h1>
	</div>
	<span class="text-grey-dark">{translations.by_students_for_students}</span>
	<a href="/challenges">{translations.challenges}</a>
	<a href="/ctfs">{translations.ctf}</a>
</header> -->
