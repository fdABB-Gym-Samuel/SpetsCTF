.POSIX:

.PHONY: \
	clean \
	codegen \
	deps \
	dev \
	dev-clean \
	migrate-down \
	migrate-up \
	pgweb \
	pgweb-clean \
	pgweb-kill \
	postgres \
	postgres-clean \
	postgres-kill \
	psql \
	seed \
	t

codegen:
	mkdir -p ./src/lib/generated
	bun run db:generate

dev-clean:
	rm -rf ./src/lib/generated
	rm -rf ./.svelte-kit ./node_modules ./build

clean: pgweb-clean postgres-clean dev-clean
	if [ -L ./tmp ]; then \
		rm -rf $$(readlink ./tmp); \
		unlink ./tmp; \
	fi

deps:
	bun install

dev: deps postgres migrate-up pgweb codegen
	bun --bun run dev

./tmp:
	ln -sf $$(mktemp -d) ./tmp

psql:
	psql -U spetsctf "postgresql:///spetsctf?host=$$(readlink ./tmp)"

migrate-up: postgres
	migrate -path ./database/migrations -database "postgresql://spetsctf@/spetsctf?host=$$(readlink ./tmp)" up

migrate-down: postgres
	migrate -path ./database/migrations -database "postgresql://spetsctf@/spetsctf?host=$$(readlink ./tmp)" down

./tmp/.pgdata: ./tmp
	initdb \
		--username=spetsctf \
		-D ./tmp/.pgdata \
		--auth-local=trust

seed:
	psql -U spetsctf "postgresql:///spetsctf?host=$$(pwd)/tmp" < ./database/seed.sql

postgres: ./tmp/.pgdata
	if [ ! -f ./tmp/.pgdata/postmaster.pid ]; then \
		pg_ctl -D ./tmp/.pgdata start -o "-c unix_socket_directories=$$(pwd)/tmp -c listen_addresses=''"; \
		psql -h $$(readlink ./tmp) -U spetsctf postgres -c "CREATE DATABASE spetsctf;" 2>/dev/null || true; \
	fi
	while [ ! -S ./tmp/.s.PGSQL.5432 ]; do sleep 0.5; done

postgres-kill:
	if [ -f ./tmp/.pgdata/postmaster.pid ]; then \
		kill $$(head -n1 ./tmp/.pgdata/postmaster.pid); \
		while [ -f ./tmp/.pgdata/postmaster.pid ]; do sleep 0.5; done \
		fi

postgres-clean: postgres-kill
	rm -rf ./tmp/postgres ./tmp/.pgdata

pgweb: ./tmp
	daemonize \
		-c . \
		-p ./tmp/pgweb.pid \
		-l ./tmp/pgweb.lock \
		$$(which pgweb) \
		--url="postgresql://spetsctf@/spetsctf?host=$$(readlink ./tmp)" \
		--skip-open

pgweb-kill:
	if [ -f ./tmp/pgweb.pid ] && [ -d "/proc/$$(head -n1 ./tmp/pgweb.pid)" ]; then \
		kill $$(head -n1 ./tmp/pgweb.pid); \
	fi

pgweb-clean: pgweb-kill
	rm -rf ./tmp/pgweb*

t:
	./src/lib/translations/addtranslation.sh