<script lang="ts">
	let { data } = $props();
	let { translations } = data;
</script>

<div class="content w-1/2 px-[var(--main-padding-inline)] pt-5">
	<h1 class="route-title">{translations.who_are_we}</h1>
	<article>
		<p>
			{translations.spets_ctf_is_a}
			{translations.you_can_play} <a href="/challenges" class="">{translations.wargames}</a>
			{translations.or_join} <a href="/ctf">{translations.spetsctf}</a>
			{translations.when_its_time}
		</p>
		<br />
		<p>
			Lorem ipsum dolor sit amet, consectetur adipisicing elit. Itaque accusantium consectetur nemo
			nam voluptatibus deserunt corporis id facilis, sint soluta recusandae vitae temporibus rerum
			adipisci provident alias impedit minima a accusamus cupiditate libero ratione! Eum facere
			dicta quibusdam nam expedita nihil et asperiores debitis, porro eius temporibus saepe
			veritatis deserunt delectus amet magnam itaque. <br /><br />Quod at omnis incidunt,
			praesentium possimus aut consequuntur ipsa dolorem officiis vero quaerat veritatis animi
			maiores, ut repellat aliquid velit, qui in accusamus. Provident amet, distinctio molestias,
			nobis in fugit similique tenetur recusandae, ea earum iure perspiciatis non quo vero sit
			quidem nulla dolorum doloribus nihil neque laboriosam pariatur vitae consequuntur! Maiores
			facere omnis dicta cupiditate consectetur perspiciatis deserunt reprehenderit, eaque at
			aspernatur quae ratione voluptate dignissimos dolore corporis? Harum deserunt omnis vel ex
			autem non rem? Animi, quaerat quidem rerum ex debitis voluptates nostrum quis iusto unde
			reprehenderit. Accusamus voluptas modi mollitia architecto facilis non!
		</p>
	</article>
</div>
