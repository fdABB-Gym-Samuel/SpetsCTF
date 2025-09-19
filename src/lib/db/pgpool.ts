import pg from 'pg';
const { Pool } = pg;
import { env } from '$env/dynamic/private';

const pool = new Pool({
    connectionString: env.DATABASE_URL,
    connectionTimeoutMillis: 20 * 1000,
    idleTimeoutMillis: 30 * 1000,
    max: 10,
});

export default pool;
