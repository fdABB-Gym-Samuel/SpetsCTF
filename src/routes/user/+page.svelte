<script lang="ts">
  import { enhance } from '$app/forms';
  let { data, form } = $props();
  let { translations, user, availableClasses } = data;
</script>

<div class='p-4 flex flex-col space-y-4'>
  <h1>{translations.settings}</h1>
  {#if form && form?.success}
    <span class="text-green-600 font-bold">{translations.settingsupdated}.</span>
  {:else if form && !form?.success}
    <span class="text-red-600 font-bold">{translations.settingsupdatefailed}.</span>
  {/if}
  <span>{translations.currentlyloggedinas} <b>{user.github_username}</b>.</span>
  <form method='POST' action='?/logout' use:enhance>
    <button type="submit">{translations.logout}</button>
  </form>
  <h2 class="font-bold text-xl">{translations.altersettings}</h2>
  <form class='flex flex-col space-y-1 w-min' method='POST' action='?/settings' use:enhance>
    <label for='display_name'>
      {translations.displayname}
    </label>
    <br>
    <input class='border border-white p-1' value={user.display_name ?? ''} name='display_name' placeholder={translations.enterdisplayname} id='display_name' />
    <br>
    <label for='represents_class'>
      {translations.representclass}
    </label>
    <br>
    <select class='border border-white p-1' name='represents_class' id='represents_class' value={user.represents_class ?? ''}>
      <option value=''>{translations.selectclass}</option>
      {#each availableClasses as availableClass}
        <option value={availableClass.name}>{availableClass.name} ({availableClass.school})</option>
      {/each}
    </select>
    <button type='submit' class="mt-3">{translations.submit}</button>
  </form>
</div>
