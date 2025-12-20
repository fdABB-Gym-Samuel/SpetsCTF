.POSIX:

.PHONY: \
	clean \
	codegen \
	deps \
	dev \
	postgres \
	postgres-clean \
	postgres-kill \
	psql

codegen:
	mkdir -p ./src/lib/generated
	bunx kysely-codegen --out-file src/lib/db/db.d.ts

dev-clean:
	rm -rf ./src/lib/generated
	rm -rf ./.svelte-kit ./node_modules ./build

clean: postgres-clean dev-clean
	if [ -L ./tmp ]; then \
		rm -rf $$(readlink ./tmp)
		unlink ./tmp \
	fi

deps:
	bun install

dev: deps postgres
	bun --bun run dev

./tmp:
	ln -sf $$(mktemp -d) ./tmp

psql: postgres
	psql -U spetsctf postgresql:///spetsctf?host=$$(readlink ./tmp)

./tmp/.pgdata: ./tmp
	initdb \
		--username=spetsctf \
		-D ./tmp/.pgdata \
		--auth-local=trust

postgres: ./tmp/.pgdata
	if [ ! -f ./tmp/.pgdata/postmaster.pid ]; then \
		pg_ctl -D ./tmp/.pgdata start -o "-c unix_socket_directories=$$(pwd)/tmp -c listen_addresses=''"; \
		psql -h $$(readlink ./tmp) -U spetsctf postgres -c "CREATE DATABASE spetsctf;" 2>/dev/null || true; \
	fi

postgres-kill:
	if [ -f ./tmp/.pgdata/postmaster.pid ]; then \
		kill $$(head -n1 ./tmp/.pgdata/postmaster.pid); \
		while [ -f ./tmp/.pgdata/postmaster.pid ]; do sleep 0.5; done \
		fi

postgres-clean: postgres-kill
	rm -rf ./tmp/postgres ./tmp/.pgdata