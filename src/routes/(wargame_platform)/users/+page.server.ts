import type { ServerLoadEvent } from "@sveltejs/kit";
import type { PageServerLoad } from "../challenges/$types";
import { db } from "$lib/db/database";


export const load: PageServerLoad = async (event:ServerLoadEvent) => {
    const users = await db
        .selectFrom("users")
        .select([
            "display_name",
            "id"
        ])
        .execute()

    return { users }

    
} 