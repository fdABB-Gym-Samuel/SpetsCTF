BEGIN;

DROP TABLE IF EXISTS user_sessions;

DROP TABLE IF EXISTS challenge_resources;

DROP TABLE IF EXISTS ctf_submissions;

DROP TABLE IF EXISTS ctf_teams_members;

DROP TABLE IF EXISTS ctf_teams;

DROP TABLE IF EXISTS wargame_submissions;

DROP TABLE IF EXISTS challenges;

DROP TABLE IF EXISTS ctf_organizers;

DROP TABLE IF EXISTS ctf_events;

DROP TABLE IF EXISTS flag;

DROP TABLE IF EXISTS users;

DROP TABLE IF EXISTS classes;

DROP TYPE IF EXISTS challenge_resource_type;

DROP TYPE IF EXISTS category;

DROP EXTENSION IF EXISTS "pg_trgm";

DROP EXTENSION IF EXISTS "pgcrypto";

COMMIT;
