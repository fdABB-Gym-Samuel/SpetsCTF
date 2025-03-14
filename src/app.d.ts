// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

import type { Pool } from 'pg';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			pgpool: Pool;
			translations: Record<string, string>;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
