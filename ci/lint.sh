#!/usr/bin/env bash

ERR=0

bun install || ERR=1

bun run prepare || ERR=1

make ./tmp || ERR=1
export DATABASE_URL=postgresql://spetsctf@/spetsctf?host=$(readlink ./tmp) || ERR=1
make postgres || ERR=1
make codegen || ERR=1

echo "::add-matcher::ci/matchers/svelte.json"
bunx sv check --output machine-verbose || ERR=1
echo "::remove-matcher owner=svelte::"

echo "::add-matcher::ci/matchers/eslint.json"
bunx eslint --format json | jq -r '.[] | select(.messages | length > 0) | .filePath as $file | .messages[] | "\($file):\(.line):\(.column):\(if .severity == 2 then "error" else "warning" end):\(.ruleId):\(.message)"'
ERR=$?
echo "::remove-matcher owner=eslint::"

exit $ERR
