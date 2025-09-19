import { Kysely, PostgresDialect } from 'kysely';
import type { DB } from './db.d.ts';
import pool from './pgpool';

const dialect = new PostgresDialect({
    pool,
});

export const db = new Kysely<DB>({
    dialect,
});
