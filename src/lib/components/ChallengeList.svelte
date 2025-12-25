<script lang="ts">
  import ChallengeCard from "./ChallengeCard.svelte";
  import VSeperator from "./VSeperator.svelte";
  import type { Challenges } from "$lib/generated/db";
  import type { Selectable } from "kysely";
  import { capitalizeFirstLetter } from "$lib/utils/utils";
  import { categories } from "$lib/db/constants";

  interface Props {
		challenges: (Selectable<Challenges> & {num_solvers: number} & {solved: boolean})[];
    gotoChallenge: (challengeId: string) => void;
  }

  let { challenges, gotoChallenge  }: Props = $props();
</script>

<section class="challenge-container w-full">
{#each categories as category (category)}
<div class="category-container mb-16">
	<h3 class="category-header gsap-top-down-opacity mb-2 text-lg font-bold">
		{capitalizeFirstLetter(category)}
	</h3>
	{#if challenges.filter((challenge) => challenge.challenge_category == category?.toLowerCase()).length > 0}
		<ul
			class="grid grid-cols-[repeat(auto-fill,minmax(305px,1fr))] gap-4 sm:grid-cols-[repeat(auto-fill,minmax(350px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(390px,1fr))]"
		>
			{#each challenges.filter((challenge) => challenge.challenge_category == category?.toLowerCase()) as challengeData (challengeData.challenge_id)}
				<li class="gsap-left-right-opacity min-h-fit min-w-65">
				  <button
				  	class="w-full hover:cursor-pointer"
            onclick={() => gotoChallenge(challengeData.challenge_id)}
				  >
						<ChallengeCard {challengeData}></ChallengeCard>
					</button>
				</li>
			{/each}
		</ul>
	{:else}
		<p class="mb-4">No challenges yet</p>
	{/if}
	<br />
	<VSeperator />
</div>
{/each}
</section>
