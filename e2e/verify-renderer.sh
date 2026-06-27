#!/usr/bin/env bash
#
# verify-renderer.sh — render a renderer app against the SUT and screenshot it.
#
# Spins up the harness described in e2e/RENDERER-VERIFICATION.md:
#   1. ensures the SUT (mvc-app1) is running on a port (default 8091)
#   2. temporarily points the renderer's dev server at the SUT (baseUrl + proxy)
#   3. runs `yarn dev`, screenshots the route, then restores the app's files.
#
# Usage:
#   e2e/verify-renderer.sh <app> <route> [output.png] [sutPort]
#
# Examples:
#   e2e/verify-renderer.sh slds /sections
#   e2e/verify-renderer.sh sapui5 /field-types /tmp/sapui5-fields.png
#   e2e/verify-renderer.sh redwood-oj /tabs /tmp/redwood-tabs.png 8091
#
# Apps: vaadin | sapui5 | slds | redwood-oj | redhat
set -euo pipefail

APP="${1:?usage: verify-renderer.sh <app> <route> [output.png] [sutPort]}"
ROUTE="${2:?missing <route>, e.g. /sections}"
OUT="${3:-/tmp/mateu-${APP}$(echo "$ROUTE" | tr '/' '-').png}"
SUT_PORT="${4:-8091}"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APP_DIR="$ROOT/frontend/web/monorepo/apps/$APP"
SUT_JAR="$ROOT/e2e/sut/apps/mvc-app1/target/mvc-app1-1.0.0-SNAPSHOT.jar"
E2E_DIR="$ROOT/e2e"

[ -d "$APP_DIR" ] || { echo "No such renderer app: $APP_DIR"; exit 1; }

cleanup() {
  [ -n "${DEV_PID:-}" ] && kill "$DEV_PID" 2>/dev/null || true
  pkill -f "vite" 2>/dev/null || true
  [ -f /tmp/vr_index.bak ] && cp /tmp/vr_index.bak "$APP_DIR/index.html"
  [ -f /tmp/vr_vite.bak ] && cp /tmp/vr_vite.bak "$APP_DIR/vite.config.ts"
  echo "Restored $APP index.html / vite.config.ts"
}
trap cleanup EXIT

# 1. SUT ----------------------------------------------------------------------
if ! curl -sf "http://localhost:$SUT_PORT/" >/dev/null 2>&1; then
  [ -f "$SUT_JAR" ] || { echo "Build the SUT first: (cd e2e/sut/modules/sample1 && mvn -q install) && (cd e2e/sut/apps/mvc-app1 && mvn -q -DskipTests install)"; exit 1; }
  echo "Starting SUT on $SUT_PORT ..."
  java -jar "$SUT_JAR" --server.port="$SUT_PORT" >/tmp/vr_sut.log 2>&1 &
  for _ in $(seq 1 40); do curl -sf "http://localhost:$SUT_PORT/" >/dev/null 2>&1 && break; sleep 2; done
fi

# 2. temporary harness wiring -------------------------------------------------
cp "$APP_DIR/index.html" /tmp/vr_index.bak
cp "$APP_DIR/vite.config.ts" /tmp/vr_vite.bak

# point the active <mateu-ui> at the route under test (# delimiter: routes contain /)
perl -0pi -e "s#(<mateu-ui[^>]*baseUrl=)\"[^\"]*\"#\$1\"$ROUTE\"#" "$APP_DIR/index.html"

# proxy the per-route SUT API (/<route>/mateu/v3) to the SUT. Two vite proxy styles:
TARGET="http://localhost:$SUT_PORT"
if grep -q "Object.fromEntries(\[" "$APP_DIR/vite.config.ts"; then
  # vaadin style: array of path strings mapped to a single target
  perl -0pi -e "s#(Object.fromEntries\(\[)#\$1\n            '^/.*/mateu/v3',#" "$APP_DIR/vite.config.ts"
  perl -0pi -e "s#target: '[^']*'#target: '$TARGET'#g" "$APP_DIR/vite.config.ts"
else
  # object style: inject a regex entry into the proxy object
  perl -0pi -e "s#(proxy:\s*\{)#\$1\n      '^/.*/mateu/v3': '$TARGET',#" "$APP_DIR/vite.config.ts"
fi

# 3. dev server + screenshot --------------------------------------------------
( cd "$APP_DIR" && yarn dev >/tmp/vr_dev.log 2>&1 ) &
DEV_PID=$!
for _ in $(seq 1 30); do curl -sf "http://localhost:5173/" >/dev/null 2>&1 && break; sleep 1; done

echo "Screenshotting $APP $ROUTE -> $OUT"
( cd "$E2E_DIR" && node screenshot.mjs --url "http://localhost:5173$ROUTE" --output "$OUT" \
    --wait-for mateu-ui --width 1300 --height 850 --settle 6000 --timeout 30000 )

echo "Done: $OUT"
