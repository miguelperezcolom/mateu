#!/usr/bin/env bash
#
# conformance.sh — run the renderer conformance suite (conformance.mjs) against one renderer.
#
# Same harness wiring as verify-renderer.sh, but instead of pinning ONE route it sets
# baseUrl="" (so <mateu-ui> resolves the route from the URL path) and iterates every fixture
# in conformance-fixtures.json, producing screenshots + a parity report under
# e2e/conformance-report/<app>/.
#
#   1. ensures the SUT (mvc-app1) is running (default port 8091)
#   2. temporarily points the renderer's dev server at the SUT (baseUrl="" + /.*/mateu/v3 proxy)
#   3. runs `yarn dev`, runs conformance.mjs, then restores the app's files.
#
# Usage:
#   e2e/conformance.sh <app> [sutPort] [extra conformance.mjs args...]
#
# Examples:
#   e2e/conformance.sh vaadin
#   e2e/conformance.sh sapui5
#   e2e/conformance.sh redwood-oj 8091 --routes /sections,/full-crud
#
# The dev server runs on a dedicated port (CONF_PORT, default 5199) so an already-running
# `yarn dev` of any app on 5173 is left alone. NOTE: the harness still patches the app's
# index.html/vite.config.ts while it runs (restored on exit), so a dev server of the SAME app
# will hot-restart against the patched config during the run.
#
# Apps: vaadin | sapui5 | slds | redwood-oj | redhat
set -euo pipefail

APP="${1:?usage: conformance.sh <app> [sutPort] [extra args...]}"
SUT_PORT="${2:-8091}"
shift $(( $# > 1 ? 2 : 1 ))
PORT="${CONF_PORT:-5199}"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APP_DIR="$ROOT/frontend/web/monorepo/apps/$APP"
SUT_JAR="$ROOT/e2e/sut/apps/mvc-app1/target/mvc-app1-1.0.0-SNAPSHOT.jar"
E2E_DIR="$ROOT/e2e"

[ -d "$APP_DIR" ] || { echo "No such renderer app: $APP_DIR"; exit 1; }

cleanup() {
  [ -n "${DEV_PID:-}" ] && kill "$DEV_PID" 2>/dev/null || true
  # kill only OUR vite (dedicated port) — leave any other running dev server alone
  pkill -f "vite.*--port $PORT" 2>/dev/null || true
  [ -f /tmp/conf_index.bak ] && cp /tmp/conf_index.bak "$APP_DIR/index.html"
  [ -f /tmp/conf_vite.bak ] && cp /tmp/conf_vite.bak "$APP_DIR/vite.config.ts"
  echo "Restored $APP index.html / vite.config.ts"
}
trap cleanup EXIT

# 1. SUT ----------------------------------------------------------------------
if ! curl -sf "http://localhost:$SUT_PORT/" >/dev/null 2>&1; then
  [ -f "$SUT_JAR" ] || { echo "Build the SUT first: (cd e2e/sut/modules/sample1 && mvn -q install) && (cd e2e/sut/apps/mvc-app1 && mvn -q -DskipTests install)"; exit 1; }
  echo "Starting SUT on $SUT_PORT ..."
  java -jar "$SUT_JAR" --server.port="$SUT_PORT" >/tmp/conf_sut.log 2>&1 &
  for _ in $(seq 1 40); do curl -sf "http://localhost:$SUT_PORT/" >/dev/null 2>&1 && break; sleep 2; done
fi

# 2. temporary harness wiring -------------------------------------------------
cp "$APP_DIR/index.html" /tmp/conf_index.bak
cp "$APP_DIR/vite.config.ts" /tmp/conf_vite.bak

# baseUrl="" so <mateu-ui> takes the route from the URL path (multi-route session)
perl -0pi -e "s#(<mateu-ui[^>]*baseUrl=)\"[^\"]*\"#\$1\"\"#" "$APP_DIR/index.html"

# proxy the per-route SUT API (/<route>/mateu/v3) to the SUT. Two vite proxy styles:
TARGET="http://localhost:$SUT_PORT"
if grep -q "Object.fromEntries(\[" "$APP_DIR/vite.config.ts"; then
  # vaadin style: array of path strings mapped to a single target
  perl -0pi -e "s#(Object.fromEntries\(\[)#\$1\n            '^/.*/mateu/v3',#" "$APP_DIR/vite.config.ts"
  perl -0pi -e "s#target: '[^']*'#target: '$TARGET'#g" "$APP_DIR/vite.config.ts"
else
  # object style: inject a regex entry into the proxy object and retarget existing entries
  perl -0pi -e "s#(proxy:\s*\{)#\$1\n      '^/.*/mateu/v3': '$TARGET',#" "$APP_DIR/vite.config.ts"
  perl -0pi -e "s#http://localhost:8091#$TARGET#g; s#http://localhost:8592#$TARGET#g" "$APP_DIR/vite.config.ts"
fi

# 3. dev server + conformance run ---------------------------------------------
( cd "$APP_DIR" && yarn dev --port "$PORT" --strictPort >/tmp/conf_dev.log 2>&1 ) &
DEV_PID=$!
for _ in $(seq 1 30); do curl -sf "http://localhost:$PORT/" >/dev/null 2>&1 && break; sleep 1; done
curl -sf "http://localhost:$PORT/" >/dev/null 2>&1 || { echo "Dev server did not start — see /tmp/conf_dev.log"; exit 1; }

( cd "$E2E_DIR" && node conformance.mjs --base-url "http://localhost:$PORT" --renderer "$APP" "$@" )
