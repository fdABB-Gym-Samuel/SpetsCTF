// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

import type { Session, User } from '$lib/db/schema';
import type { Pool } from 'pg';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			pgpool: Pool;
			session: Session | null;
			translations: Record<string, string>;
			user: User | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
