<script lang="ts">
	import { resolve } from "$app/paths";

	let { data } = $props();
	let { translations } = data;
	import { Wrench } from '@lucide/svelte';
</script>

<div class="content">
	<h1>{translations.cuttingedgeadmintools}</h1>
	<ul class="mt-4 flex flex-col space-y-4">
			<li class="flex flex-row">
				<Wrench class="mr-3" />
				<a class="text-primary underline" href={resolve('/admin/create-challenge')}>
					{translations.createchallenge}
				</a>
			</li>
			<li class="flex flex-row">
				<Wrench class="mr-3" />
				<a class="text-primary underline" href={resolve('/admin/create-ctf')}>
					{translations.createctf}
				</a>
			</li>
			<li class="flex flex-row">
				<Wrench class="mr-3" />
				<a class="text-primary underline" href={resolve('/admin/approve')}>
					{translations.approve}
				</a>
			</li>
	</ul>
</div>
