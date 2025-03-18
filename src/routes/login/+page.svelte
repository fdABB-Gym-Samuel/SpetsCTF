<script lang="ts">
	let { data } = $props();
	let { translations } = data;
</script>

<h1>{translations.login}</h1>
<a href="/login/github">{translations.loginwithgithub}</a>
