<script lang="ts">
    import BackToTop from '$lib/components/BackToTop.svelte';
    import IconArrowUpRightBold from 'phosphor-icons-svelte/IconArrowUpRightBold.svelte';
</script>

<footer class="mt-64 flex w-full flex-col items-center justify-center">
    <BackToTop />
    <div
        class="text-text-150 mt-64 mb-4 flex w-full flex-wrap justify-between gap-x-8 gap-y-12 text-sm sm:gap-y-4">
        <div class="flex flex-wrap gap-x-12 gap-y-1">
            <div class="*:inline-block">
                <p class="mr-4 min-w-max">
                    This project is open-source, feel free to help.
                </p>
                <a
                    class="text-text-200 *:inline-block"
                    href="https://github.com/fdABB-Gym-Samuel/SpetsCTF"
                    target="_blank"
                    >Contribute <IconArrowUpRightBold class="text-base" /></a>
            </div>
            <p>
                Encounter any issues? Reach out to <span class="font-semibold"
                    >Samuel Olsson</span>
                or <span class="font-semibold">Eric Thorburn</span> on teams.
            </p>
        </div>
        <div class="flex flex-wrap gap-x-4">
            <p>&copy; {new Date().getFullYear()} spetsen.net</p>
            <p class="text-text-200">Design by Hannes Gingby</p>
        </div>
    </div>
</footer>
