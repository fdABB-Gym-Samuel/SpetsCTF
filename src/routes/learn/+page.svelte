<script>
    let { data } = $props();
    let translations = $derived(data.translations);

    const resources = $derived([
        {
            category: translations.general,
            links: [
                { name: 'Säkerhetssm', url: 'https://sakerhetssm.se/challenges' },
                { name: 'PicoCTF', url: 'https://picoctf.org/index.html#picogym' },
                { name: 'Hack The Box', url: 'https://www.hackthebox.com/' },
                { name: 'Try Hack Me', url: 'https://tryhackme.com/' },
                { name: 'OverTheWire', url: 'https://overthewire.org/wargames/' },
                { name: 'Root Me', url: 'https://www.root-me.org/?lang=en' },
            ],
        },
        {
            category: translations.crypto,
            links: [{ name: 'Cryptohack', url: 'https://cryptohack.org/' }],
        },
        {
            category: translations.forensics,
            links: [{ name: 'Blueteamlabs', url: 'https://blueteamlabs.online/' }],
        },
        {
            category: translations.osint,
            links: [{ name: 'Sourcing Games', url: 'https://sourcing.games' }],
        },
        {
            category: translations.pwn,
            links: [{ name: 'pwn.college', url: 'https://pwn.college/' }],
        },
        {
            category: translations.reversing,
            links: [{ name: 'crackmes.one', url: 'https://crackmes.one/' }],
        },
        {
            category: translations.web,
            links: [
                {
                    name: 'Web Security Academy',
                    url: 'https://portswigger.net/web-security',
                },
            ],
        },
    ]);
</script>

<main class="mx-auto w-[80%] pt-24 sm:m-auto">
    <div class="mb-8">
        <h3 class="text-3xl">{translations.learning_resources}</h3>
    </div>
    <ul class="space-y-8 text-xl">
        {#each resources as { category, links }}
            <li>
                <h6 class="text-xl">{category}:</h6>
                <ul class="mt-1 ml-4 list-inside list-disc text-base">
                    {#each links as { name, url }}
                        <li>
                            <a class="text-primary link" href={url}>{name}</a>
                        </li>
                    {/each}
                </ul>
            </li>
        {/each}
    </ul>
</main>
