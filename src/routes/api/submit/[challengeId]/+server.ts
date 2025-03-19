// import type { LoadEvent } from "@sveltejs/kit";

import { db } from '$lib/db/database.js'
import { error, json } from '@sveltejs/kit'
import type { WargameSubmissions } from '$lib/db/db'
import type { Insertable } from 'kysely'


export const POST = async({ request, locals, params }) => {
    if(!locals.user){
        return error(401, {
            message: "User not logged in"
        })
    }

    const { challengeId } = params
    const flag = await get_flag_of_challenge(challengeId)

    if(!flag) 
        return error(404, {message: "Flag of challenge not found"})
    

    let flag_correct: boolean = false
    const submitted_flag = (await request.formData()).get("flag")?.toString()
    if (submitted_flag === flag.flag)
        flag_correct = true
    

    const user_id = locals.user?.id
    let submission: Insertable<WargameSubmissions> = {
        challenge: challengeId,
        user_id: user_id,
        time: new Date(),
        success: flag_correct,
        submitted_data: submitted_flag
    }

    const _ = await db 
        .insertInto("wargame_submissions")
        .values(submission)
        .executeTakeFirst()

    return json({
        success: true,
        message: "Youre a real skibidi sigma!" 
    })
}

const get_flag_of_challenge = async(challenge_id:string) => {
    const flag_object = await db 
        .selectFrom("challenges")
        .select("flag")
        .where("challenge_id", "=", challenge_id)
        .executeTakeFirst()

    if (!flag_object){
        return error(404, {message: "Challenge Not Found"})
    }
    const flag_id = flag_object["flag"]

    const flag = await db
        .selectFrom("flag")
        .select("flag")
        .where("id", "=", flag_id)
        .executeTakeFirst()
    
    return flag
}