#!/usr/bin/env bash
# The YAML-only federation, end to end (README.md):
#
#   :18480  the console    — served, YAML only (console/), menu = two RemoteMenus
#   :18481  Orders         — served, YAML only (orders/, mounted at /orders)
#   :18482  Catalog + API  — static files only: the catalog's bundle (catalog/target/mateu-bundle)
#                            and the JSON both domains read (api/), behind serve-static.mjs
#
#   ./run.sh            build the three modules, then start the three servers (PIDs in .pids)
#   ./run.sh --no-build start them on what is already built
#   ./run.sh stop       stop them (by PID)
#
# Then: cd ../../.. && cd e2e && npx playwright test --project yaml-federation
# Maven options (e.g. -Dmaven.repo.local=…) can be passed in MVN_OPTS_EXTRA; JAVA overrides `java`.
set -euo pipefail
cd "$(dirname "$0")"
PIDS=.pids
JAVA=${JAVA:-java}

stop() {
  [ -f "$PIDS" ] || return 0
  while read -r pid; do kill "$pid" 2>/dev/null || true; done < "$PIDS"
  rm -f "$PIDS"
}

if [ "${1:-}" = "stop" ]; then stop; echo "stopped"; exit 0; fi

if [ "${1:-}" != "--no-build" ]; then
  # shellcheck disable=SC2086
  mvn -q -B package -DskipTests ${MVN_OPTS_EXTRA:-}
fi

stop
"$JAVA" -jar console/target/yaml-fed-console-1.0.0-SNAPSHOT.jar > console.log 2>&1 & echo $! >> "$PIDS"
"$JAVA" -jar orders/target/yaml-fed-orders-1.0.0-SNAPSHOT.jar > orders.log 2>&1 & echo $! >> "$PIDS"
node serve-static.mjs 18482 > static.log 2>&1 & echo $! >> "$PIDS"
for port in 18480 18481 18482; do
  for _ in $(seq 1 90); do curl -s -o /dev/null "http://localhost:$port/" && break; sleep 2; done
done
echo "console http://localhost:18480 · orders http://localhost:18481/orders · catalog http://localhost:18482"
echo "stop with: $0 stop"
