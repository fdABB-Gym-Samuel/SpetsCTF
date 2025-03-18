schema:
    . .env
    psql "$DATABASE_URL" < schema/schema.sql

codegen:
    npx kysely-codegen --out-file src/lib/db/db.d.ts
    
