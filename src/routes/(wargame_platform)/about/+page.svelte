<script lang="ts">
	let { data } = $props();
	let { translations } = data;
</script>

<div class="content w-1/2 px-[var(--main-padding-inline)] pt-5">
	<h1 class="route-title">{translations.who_are_we}</h1>
	<p>
		{translations.spets_ctf_is_a}
		{translations.you_can_play} <a href="/challenges" class="">{translations.wargames}</a>
		{translations.or_join} <a href="/ctf">{translations.spetsctf}</a>
		{translations.when_its_time}
	</p>
</div>
