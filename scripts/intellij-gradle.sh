#!/usr/bin/env bash
# Runs a Gradle invocation of the IntelliJ plugin (frontend/app/intellij-plugin) so that the known
# flaky failure of the IntelliJ Platform Gradle Plugin cannot turn a PR red on its own:
#
#   Could not find bundled plugin with ID: 'com.intellij.java'
#
# Root cause (JetBrains/intellij-platform-gradle-plugin#2192, MP-8217): while it builds the IDE
# LAYOUT INDEX from a freshly extracted IDE, intellij-plugin-structure reads every bundled plugin's
# descriptor through a cache of open jar file systems capped at 256 entries; IntelliJ 2025.2 has
# ~530 distinct jars, so a handle can be evicted (closed) while it is still being read. The
# ClosedFileSystemException is swallowed ("Unable to read descriptor [plugin.xml] from
# .../java-impl.jar"), the plugin is silently missing from the index, and the lookup fails later with
# the misleading message above. Measured upstream: ~1 in 6 runs with a COLD index, 0 with a warm
# one. CI always had a cold index (run_tests.yml only runs on pull requests and setup-gradle only
# writes its cache on master, so nothing was ever cached).
#
# So this script:
#   1. drops a persisted index that lacks com.intellij.java (a poisoned one would fail every run);
#   2. runs the Gradle command;
#   3. on exactly that failure signature, deletes the index, stops the daemon (the index also lives in
#      a build service's memory) and retries ONCE. Any other failure is reported as is.
#
# The caller caches .intellijPlatform/layoutIndex (see `layout_index_ok` below), which removes the
# window entirely on later runs.
#
# Usage: scripts/intellij-gradle.sh test --console=plain
#        scripts/intellij-gradle.sh --check-index   # exit 0 iff a complete layout index is present
set -uo pipefail

cd "$(dirname "$0")/../frontend/app/intellij-plugin" || exit 1
INDEX_DIR=.intellijPlatform/layoutIndex

# A complete index names the bundled plugins the build depends on (build.gradle.kts bundledPlugin).
layout_index_ok() {
  local f
  for f in "$INDEX_DIR"/*.json; do
    [ -f "$f" ] || return 1
    grep -q '"id":"com.intellij.java"' "$f" && grep -q '"id":"org.jetbrains.plugins.yaml"' "$f" || return 1
  done
}

if [ "${1:-}" = "--check-index" ]; then
  layout_index_ok
  exit $?
fi

if [ -d "$INDEX_DIR" ] && ! layout_index_ok; then
  echo "::warning::Discarding an incomplete IntelliJ layout index (it lacks a bundled plugin the build needs)."
  rm -rf "$INDEX_DIR"
fi

log="${RUNNER_TEMP:-/tmp}/intellij-gradle.log"
./gradlew "$@" 2>&1 | tee "$log"
rc=${PIPESTATUS[0]}
[ "$rc" = 0 ] && exit 0

if grep -q "Could not find bundled plugin with ID" "$log"; then
  echo "::warning::IntelliJ Platform Gradle Plugin lost a bundled plugin while indexing the IDE (JetBrains/intellij-platform-gradle-plugin#2192) — rebuilding the index and retrying once."
  rm -rf "$INDEX_DIR"
  ./gradlew --stop >/dev/null 2>&1 || true
  ./gradlew "$@"
  exit $?
fi
exit "$rc"
