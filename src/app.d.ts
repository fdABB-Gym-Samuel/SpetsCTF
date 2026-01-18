import type { Users, UserSessions } from '$lib/generated/db';
import type { Selectable } from 'kysely';

declare global {
    namespace App {
        // interface Error {}
        interface Locals {
            session: Selectable<UserSessions> | undefined;
            translations: Record<string, string>;
            user: Selectable<Users> | undefined;
        }
        // interface PageData {}
        // interface PageState {}
        // interface Platform {}
    }
}

export {};
