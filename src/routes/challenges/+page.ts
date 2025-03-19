import type { PageLoad, PageLoadEvent } from "./$types";

export const load: PageLoad = (event: PageLoadEvent) => {
    const challengeId = event.url.searchParams.get('show')
    console.log("SHOW PARAM IS: ", challengeId);

    return {
        challengeId
    }
}