#!/usr/bin/env bash
# The Explorer's distributed examples, in one command (see ../README.md, "Run the distributed examples"):
#
#   ./run.sh                 build the remotes, start them all AND the Explorer (PIDs in .pids)
#   ./run.sh --no-build      start on what is already built
#   ./run.sh --remotes-only  start only the remotes (run the Explorer yourself: mvn spring-boot:run)
#   ./run.sh stop            stop everything this script started
#
# Ports (env, defaults in brackets): EXPLORER_PORT [8640], JAVA_REMOTE_PORT [8641],
# YAML_REMOTE_PORT [8642], STATIC_REMOTE_PORT [8643], PYTHON_REMOTE_PORT [8644].
# The Python remote starts only when python-remote/.venv exists (python3 -m venv .venv &&
# .venv/bin/pip install -r requirements.txt, inside python-remote/).
# Extra Maven options in MVN_OPTS_EXTRA; JAVA overrides `java`.
set -euo pipefail
cd "$(dirname "$0")"
PIDS=.pids
JAVA=${JAVA:-java}

export EXPLORER_PORT=${EXPLORER_PORT:-8640}
export JAVA_REMOTE_PORT=${JAVA_REMOTE_PORT:-8641}
export YAML_REMOTE_PORT=${YAML_REMOTE_PORT:-8642}
export STATIC_REMOTE_PORT=${STATIC_REMOTE_PORT:-8643}
export PYTHON_REMOTE_PORT=${PYTHON_REMOTE_PORT:-8644}
# what the remotes allow (CORS) and what the Explorer calls
export EXPLORER_ORIGIN=${EXPLORER_ORIGIN:-http://localhost:$EXPLORER_PORT}
export EXPLORER_JAVA_REMOTE_URL=${EXPLORER_JAVA_REMOTE_URL:-http://localhost:$JAVA_REMOTE_PORT}
export EXPLORER_YAML_REMOTE_URL=${EXPLORER_YAML_REMOTE_URL:-http://localhost:$YAML_REMOTE_PORT}
export EXPLORER_STATIC_REMOTE_URL=${EXPLORER_STATIC_REMOTE_URL:-http://localhost:$STATIC_REMOTE_PORT}
export EXPLORER_PYTHON_REMOTE_URL=${EXPLORER_PYTHON_REMOTE_URL:-http://localhost:$PYTHON_REMOTE_PORT}

stop() {
  [ -f "$PIDS" ] || return 0
  while read -r pid; do kill "$pid" 2>/dev/null || true; done < "$PIDS"
  rm -f "$PIDS"
}

case "${1:-}" in
  stop) stop; echo "stopped"; exit 0 ;;
esac

if [ "${1:-}" != "--no-build" ]; then
  # shellcheck disable=SC2086
  mvn -q -B package -DskipTests ${MVN_OPTS_EXTRA:-}
  if [ "${1:-}" != "--remotes-only" ]; then
    # shellcheck disable=SC2086
    (cd .. && mvn -q -B package -DskipTests ${MVN_OPTS_EXTRA:-})
  fi
fi

stop
"$JAVA" -jar java-remote/target/explorer-java-remote-1.0-SNAPSHOT.jar > java-remote.log 2>&1 & echo $! >> "$PIDS"
"$JAVA" -jar yaml-remote/target/explorer-yaml-remote-1.0-SNAPSHOT.jar > yaml-remote.log 2>&1 & echo $! >> "$PIDS"
node serve-static.mjs > static-remote.log 2>&1 & echo $! >> "$PIDS"
ports="$JAVA_REMOTE_PORT $YAML_REMOTE_PORT $STATIC_REMOTE_PORT"
if [ -x python-remote/.venv/bin/python ]; then
  (cd python-remote && exec .venv/bin/python main.py) > python-remote.log 2>&1 & echo $! >> "$PIDS"
  ports="$ports $PYTHON_REMOTE_PORT"
fi
if [ "${1:-}" != "--remotes-only" ]; then
  SERVER_PORT=$EXPLORER_PORT "$JAVA" -jar ../target/demo-explorer-1.0-SNAPSHOT.jar > explorer.log 2>&1 & echo $! >> "$PIDS"
  ports="$ports $EXPLORER_PORT"
fi
for port in $ports; do
  ok=
  for _ in $(seq 1 90); do
    if curl -s -o /dev/null "http://localhost:$port/"; then ok=1; break; fi
    sleep 2
  done
  [ -n "$ok" ] || { echo "nothing answers on :$port — see the *.log files here"; exit 1; }
done
echo "Explorer        http://localhost:$EXPLORER_PORT/distributed/overview"
echo "console (/fed)  http://localhost:$EXPLORER_PORT/fed"
echo "Java remote     $EXPLORER_JAVA_REMOTE_URL/inventory"
echo "YAML remote     $EXPLORER_YAML_REMOTE_URL/orders"
echo "static bundle   $EXPLORER_STATIC_REMOTE_URL/"
echo "stop with: $0 stop"
