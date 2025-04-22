<script lang="ts">
	let { data } = $props();
	let { users_scoreboard, classes_scoreboard } = data;

	let original_classes = classes_scoreboard.map((class_obj) => class_obj.class_name);
	let include_classes = $state(original_classes);

  let filtered_users = $derived(users_scoreboard.filter((user) =>
    user.represents_class && include_classes.includes(user.represents_class)
  ).slice(0, 15));

  import BackToTop from '$lib/components/BackToTop.svelte';

  import { playAnimations } from "$lib/gsap/animations";
	import { onDestroy, onMount } from 'svelte';

  let componentRoot : HTMLElement;
  let gsapContext: gsap.Context | undefined;

  onMount(() => {
    gsapContext = playAnimations(componentRoot)
  })

  onDestroy(() => {
    gsapContext?.revert()
  })
</script>

<main class="content pt-24 w-full max-w-[1200px] m-auto" bind:this={componentRoot}>
  <!-- TODO: add header with user info if logged in -->
	<header class="mb-12 gsap-top-down-opacity">
    <h1 class="text-xl font-bold">Hannes <span class="text-text-200">#10</span></h1>
    <p class="text-text-200">You have <span class="text-text-100">0 points</span>, currently in the <span class="text-text-100">#1 class</span>.</p>
  </header>
	<div class="scoreboards w-full flex flex-col gap-16">
    <section>
      <div class="mb-4 flex items-center justify-between">
        <h3 class="scoreboard-title text-lg font-bold gsap-top-down-opacity">Users</h3>
        <div class="class-filtering gsap-top-down-opacity flex flex-row flex-wrap gap-1.5 items-center">
          <p class="text-text-200 text-sm mr-2">Filter:</p>
          {#each original_classes as cls}
            <label class="cursor-pointer relative px-4 select-none gsap-right-left-opacity">
              <input
                type="checkbox"
                bind:group={include_classes}
                value={cls}
                id={cls}
                class="sr-only peer"
              />
              <span class="text-sm text-text-200 peer-checked:text-text-100 transition-colors">{cls}</span>
              <span
                class="w-full h-5.5 bg-bg-800 rounded-lg peer-checked:bg-bg-700 absolute left-0 top-0.5 -z-10 transition-colors"
                aria-hidden="true"
              ></span>
            </label>
          {/each}
        </div>
      </div>
      <div class="w-full min-w-20 max-h-[600px] overflow-auto bg-bg-850 px-8 py-4 rounded-lg gsap-top-down-opacity">
        {#if filtered_users.length === 0}
          <p class="text-red-500 text-sm text-center">No users, please toggle at least one class.</p>
        {:else}
          <table class="w-full table-fixed gsap-top-down-opacity">
            <thead>
              <tr
                class="min-w-20 *:px-10 *:py-2 *:bg-bg-800 [&>th:first-child]:rounded-l-lg [&>th:last-child]:rounded-r-lg"
              >
                <th class="w-1/6 text-left text-text-200 font-medium">#</th>
                <th class="w-2/6 text-left text-text-200 font-medium">Username</th>
                <th class="w-2/6 text-center text-text-200 font-medium">Class</th>
                <th class="w-1/6 text-right text-text-200 font-medium">Score</th>
              </tr>
            </thead>
          </table>

          <div class="h-4"></div>
          <table class="w-full table-fixed gsap-top-down-opacity">
            <tbody>
              {#each filtered_users as player, i}
                <tr
                  class="w-full text-wrap break-words *:px-10 *:border-bg-700 *:border-t-0
                        {i === users_scoreboard.filter((user) => user.represents_class && include_classes.includes(user.represents_class)).slice(0, 15).length - 1 ? '' : '*:border-b-3'}
                        {i === 0 ? 'text-primary' : i === 1 ? 'text-primary-light' : i === 2 ? 'text-primary-extra-light' : ''}"
                >
                  <td class="w-1/6 h-12 px-2 text-left">{i + 1}</td>
                  <td class="w-2/6 h-12 px-2 text-left break-words"
                    ><a class="ignore-default" href={`/user/${player.id}`}
                      >{player.display_name}</a
                    ></td
                  >
                  <td class="w-2/6 h-12 px-4 text-center">{player.represents_class}</td>
                  <td class="w-1/6 h-12 px-2 text-right"
                    >{player.total_points == null ? 0 : player.total_points}</td
                  >
                </tr>
              {/each}
            </tbody>
          </table>
        {/if}
      </div>
      <p class="text-text-200 mt-2 ml-0.5 gsap-top-down-opacity">{users_scoreboard.length} users</p>
    </section>

    <section>
      <h3 class="scoreboard-title text-lg font-bold mb-4 gsap-top-down-opacity">Classes</h3>
      <div class="w-full min-w-20 max-h-[300px] overflow-auto bg-bg-850 px-8 py-4 rounded-lg gsap-top-down-opacity">
        <!-- header only -->
        <table class="w-full table-fixed gsap-top-down-opacity">
          <thead>
            <tr
              class="min-w-20 *:px-10 *:py-2 *:bg-bg-800
                     [&>th:first-child]:rounded-l-lg
                     [&>th:last-child]:rounded-r-lg"
            >
              <th class="w-1/6 text-left text-text-200 font-medium">#</th>
              <th class="w-4/6 text-left text-text-200 font-medium">Class</th>
              <th class="w-1/6 text-right text-text-200 font-medium">Score</th>
            </tr>
          </thead>
        </table>

        <div class="h-4"></div>

        <!-- body only -->
        <table class="w-full table-fixed gsap-top-down-opacity">
          <tbody>
            {#each classes_scoreboard as curr_class, i}
              <tr
                class="w-full text-wrap break-words *:px-10
                       *:border-bg-700 *:border-t-0
                       {i === classes_scoreboard.length - 1 ? '' : '*:border-b-3'}
                       {i === 0 ? 'text-secondary' : ''}"
              >
                <td class="w-1/6 h-12 px-2 text-left">{i + 1}</td>
                <td class="w-4/6 h-12 px-2 text-left break-words">
                  {curr_class.class_name}
                </td>
                <td class="w-1/6 h-12 px-2 text-right">
                  {curr_class.total_points}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </section>


		<!-- <table class="min-w-20 overflow-scroll">
			<thead>
				<tr
					class=" border-b-accent-light dark:border-b-accent-dark my-10 w-fit min-w-20 border-b-1 "
				>
					<th class="w-1 px-2 text-left font-bold uppercase">#</th>
					<th class="w-1 px-2 text-left font-bold uppercase">Class</th>
					<th class="w-1 px-2 text-right font-bold uppercase">Score</th>
				</tr>
			</thead>
			<tbody>
				{#each classes_scoreboard as curr_class, i}
					<tr
						class="border-b-accent-light dark:border-b-accent-dark outline-accent-dark w-fit border-b-1 text-wrap break-words"
					>
						<td class="mt-2 h-12 px-2 text-left">{i + 1}</td>
						<td class="mt-2 h-12 px-2 text-left break-words">{curr_class.class_name}</td>
						<td class="mt-2 h-12 px-2 text-right">{curr_class.total_points}</td>
					</tr>
				{/each}
			</tbody>
		</table> -->
	</div>
</main>
<BackToTop />
