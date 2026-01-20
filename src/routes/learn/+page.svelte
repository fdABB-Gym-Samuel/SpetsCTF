<script>
    let { data } = $props();
    let translations = $derived(data.translations);
</script>

<main class="w-full pt-12 sm:m-auto">
    <div>
        <h3 class="text-3xl">{translations.learning_resources}:</h3>
    </div>
    <ul class="space-y-4 px-4 text-xl">
        <li>
            <h6 class="text-xl">
                {translations.general}:
            </h6>
            <ul class="ml-4 list-inside list-disc text-sm">
                <li>
                    <a
                        class="text-primary underline"
                        href="https://sakerhetssm.se/challenges">Säkerhetssm</a>
                </li>
                <li>
                    <a
                        class="text-primary underline"
                        href="https://picoctf.org/index.html#picogym">PicoCTF</a>
                </li>
                <li>
                    <a class="text-primary underline" href="https://www.hackthebox.com/"
                        >Hack The Box</a>
                </li>
                <li>
                    <a class="text-primary underline" href="https://tryhackme.com/"
                        >Try Hack Me</a>
                </li>
                <li>
                    <a
                        class="text-primary underline"
                        href="https://overthewire.org/wargames/">OverTheWire</a>
                </li>
                <li>
                    <a
                        class="text-primary underline"
                        href="https://www.root-me.org/?lang=en">Root Me</a>
                </li>
            </ul>
        </li>
        <li>
            <h6 class="text-xl">
                {translations.crypto}:
            </h6>
            <ul class="ml-4 list-inside list-disc text-sm">
                <li>
                    <a class="text-primary underline" href="https://cryptohack.org/"
                        >Cryptohack</a>
                </li>
            </ul>
        </li>
        <li>
            <h6>
                {translations.forensics}
            </h6>
            <ul class="ml-4 list-inside list-disc text-sm">
                <li>
                    <a
                        class="text-primary underline"
                        href="https://blueteamlabs.online/">Blueteamlabs</a>
                </li>
            </ul>
        </li>
        <li>
            <h6>
                {translations.osint}
            </h6>
            <ul class="ml-4 list-inside list-disc text-sm">
                <li>
                    <a class="text-primary underline" href="https://sourcing.games"
                        >Sourcing Games</a>
                </li>
            </ul>
        </li>
        <li>
            <h6>
                {translations.pwn}
            </h6>
            <ul class="ml-4 list-inside list-disc text-sm">
                <li>
                    <a class="text-primary underline" href="https://pwn.college/"
                        >pwn.college</a>
                </li>
            </ul>
        </li>
        <li>
            <h6>
                {translations.reversing}
            </h6>
            <ul class="ml-4 list-inside list-disc text-sm">
                <li>
                    <a class="text-primary underline" href="https://crackmes.one/"
                        >crackmes.one</a>
                </li>
            </ul>
        </li>
        <li>
            <h6>
                {translations.web}
            </h6>
            <ul class="ml-4 list-inside list-disc text-sm">
                <li>
                    <a
                        class="text-primary underline"
                        href="https://portswigger.net/web-security"
                        >Web Security Academy</a>
                </li>
            </ul>
        </li>
    </ul>
</main>
