import pg from 'pg';
const { Pool } = pg;
import { getDatabaseUrl } from '$lib/server/credentials';

const pool = new Pool({
    connectionString: getDatabaseUrl(),
    connectionTimeoutMillis: 20 * 1000,
    idleTimeoutMillis: 30 * 1000,
    max: 10,
    port: 5432,
});

export default pool;
