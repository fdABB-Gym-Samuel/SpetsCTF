// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

import type { User, UserSessions } from '$lib/generated/db';
import type { Selectable } from 'kysely';

declare global {
    namespace App {
        // interface Error {}
        interface Locals {
            session: Selectable<UserSessions> | undefined;
            translations: Record<string, string>;
            user: Selectable<User> | undefined;
        }
        // interface PageData {}
        // interface PageState {}
        // interface Platform {}
    }
}

export {};
