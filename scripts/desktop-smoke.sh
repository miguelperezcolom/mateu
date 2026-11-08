#!/usr/bin/env bash
# Smoke test of a PACKAGED Mateu desktop app, on CI (desktop.yml, desktop-base-package.yml):
# launches it, waits for the IDE to start, and passes only if idea.log says the Mateu plugin loaded.
#
#   scripts/desktop-smoke.sh macos <path to Mateu.app>
#   scripts/desktop-smoke.sh linux <unpacked linux bundle dir>   (run it under Xvfb: no display on CI)
#
# It never builds anything. Installers are built on CI ONLY (CLAUDE.md, #1000).
set -uo pipefail

platform="${1:?macos|linux}"
target="${2:?the packaged app}"
out="${RUNNER_TEMP:-${TMPDIR:-/tmp}}/mateu-smoke.out"

case "$platform" in
  macos)
    exe=$(/usr/libexec/PlistBuddy -c 'Print :CFBundleExecutable' "$target/Contents/Info.plist")
    product=$(/usr/libexec/PlistBuddy -c 'Print :CFBundleName' "$target/Contents/Info.plist")
    log="$HOME/Library/Logs/$product/idea.log"
    rm -f "$log"
    "$target/Contents/MacOS/$exe" > "$out" 2>&1 &
    ;;
  linux)
    target="${target%/}"
    log="$target/data/log/idea.log"
    grep -h '"buildNumber"\|"version"' "$target/product-info.json" | head -3
    if command -v xvfb-run > /dev/null; then xvfb-run -a sh "$target/mateu.sh" > "$out" 2>&1 &
    else sh "$target/mateu.sh" > "$out" 2>&1 &
    fi
    ;;
  *) echo "unknown platform $platform" >&2; exit 2 ;;
esac
pid=$!

for _ in $(seq 1 36); do
  sleep 5
  grep -q 'Loaded custom plugins' "$log" 2> /dev/null && break
done
sleep 20 # let the plugin's own startup run, so its errors would reach the log
kill "$pid" 2> /dev/null || true
pkill -f "$target" 2> /dev/null || true

echo "--- idea.log (selected)"
grep -E 'IDE: |Loaded custom plugins|io\.mateu|ERROR' "$log" 2> /dev/null | head -60 || true
if grep 'Loaded custom plugins' "$log" 2> /dev/null | grep -q 'Mateu'; then
  msg="✅ $platform: $(grep -m1 -o 'IDE: .*' "$log") — Mateu plugin loaded"
  echo "$msg"
  [ -n "${GITHUB_STEP_SUMMARY:-}" ] && echo "$msg" >> "$GITHUB_STEP_SUMMARY"
  exit 0
fi
echo "❌ $platform: the Mateu plugin did not load"
echo "--- launcher output"; tail -50 "$out" 2> /dev/null || true
exit 1
