.POSIX:

.PHONY: \
	clean \
	codegen \
	deps \
	dev \
	garage \
	garage-clean \
	garage-kill \
	postgres \
	postgres-clean \
	postgres-kill \
	psql \
	seed

codegen:
	mkdir -p ./src/lib/generated
	bun run db:generate

dev-clean:
	rm -rf ./src/lib/generated
	rm -rf ./.svelte-kit ./node_modules ./build

clean: postgres-clean dev-clean
	if [ -L ./tmp ]; then \
		rm -rf $$(readlink ./tmp); \
		unlink ./tmp; \
	fi

deps:
	bun install

dev: deps postgres codegen seed
	bun --bun run dev

./tmp:
	ln -sf $$(mktemp -d) ./tmp

psql:
	psql -U spetsctf postgresql:///spetsctf?host=$$(readlink ./tmp)

./tmp/.pgdata: ./tmp
	initdb \
		--username=spetsctf \
		-D ./tmp/.pgdata \
		--auth-local=trust

seed:
	psql -U spetsctf postgresql:///spetsctf?host=$$(pwd)/tmp < ./schema/seed.sql

postgres: ./tmp/.pgdata
	if [ ! -f ./tmp/.pgdata/postmaster.pid ]; then \
		pg_ctl -D ./tmp/.pgdata start -o "-c unix_socket_directories=$$(pwd)/tmp -c listen_addresses=''"; \
		psql -h $$(readlink ./tmp) -U spetsctf postgres -c "CREATE DATABASE spetsctf;" 2>/dev/null || true; \
	fi
	psql -U spetsctf postgresql:///spetsctf?host=$$(readlink ./tmp) < ./schema/schema.sql
	while [ ! -S ./tmp/.s.PGSQL.5432 ]; do sleep 0.5; done

postgres-kill:
	if [ -f ./tmp/.pgdata/postmaster.pid ]; then \
		kill $$(head -n1 ./tmp/.pgdata/postmaster.pid); \
		while [ -f ./tmp/.pgdata/postmaster.pid ]; do sleep 0.5; done \
		fi

postgres-clean: postgres-kill
	rm -rf ./tmp/postgres ./tmp/.pgdata

garage: ./tmp
	daemonize \
		-c . \
		-p ./tmp/garage.pid \
		-l ./tmp/garage.lock \
		$$(which garage) \
		--config ./config/garage/garage.toml \
		server

garage-kill:
	if [ -f ./tmp/garage.pid ]; then \
		kill $$(head -n1 ./tmp/garage.pid); \
	fi

garage-clean: garage-kill
	rm -rf ./tmp/garage