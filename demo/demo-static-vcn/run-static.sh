#!/usr/bin/env bash
# The static VCN slice, end to end, with NO Mateu backend:
#
#   :8790  the external API (external-api/server.mjs — a stand-in for a public REST API, with CORS)
#   :8791  the Java-authored site  (java/target/mateu-bundle, pre-rendered by mateu:bundle)
#   :8792  the YAML-authored site  (yaml/target/mateu-bundle, raw definitions expanded in the browser)
#
# The two sites are plain files behind a dumb static server (serve-static.mjs: files + SPA fallback).
#
#   ./run-static.sh            build both sites, then start the three servers (PIDs in .pids)
#   ./run-static.sh --no-build start them on what is already built
#   ./run-static.sh stop       stop them (by PID)
#
# Then: cd ../../e2e && npx playwright test --project static-vcn-java --project static-vcn-yaml --workers=1
# Maven options (e.g. -Dmaven.repo.local=…) can be passed in MVN_OPTS_EXTRA.
set -euo pipefail
cd "$(dirname "$0")"
PIDS=.pids

stop() {
  [ -f "$PIDS" ] || return 0
  while read -r pid; do kill "$pid" 2>/dev/null || true; done < "$PIDS"
  rm -f "$PIDS"
}

if [ "${1:-}" = "stop" ]; then stop; echo "stopped"; exit 0; fi

if [ "${1:-}" != "--no-build" ]; then
  # shellcheck disable=SC2086
  (cd java && mvn -q -B package -Pbundle -DskipTests ${MVN_OPTS_EXTRA:-})
  # shellcheck disable=SC2086
  (cd yaml && mvn -q -B package -Pbundle -DskipTests ${MVN_OPTS_EXTRA:-})
fi

stop
node external-api/server.mjs 8790 & echo $! >> "$PIDS"
node serve-static.mjs java/target/mateu-bundle 8791 & echo $! >> "$PIDS"
node serve-static.mjs yaml/target/mateu-bundle 8792 & echo $! >> "$PIDS"
sleep 1
echo "external API http://localhost:8790/api/vcns · Java site http://localhost:8791 · YAML site http://localhost:8792"
echo "stop with: $0 stop"
