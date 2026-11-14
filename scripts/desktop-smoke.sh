#!/usr/bin/env bash
# Smoke test of a PACKAGED Mateu desktop app (the hub variant), on CI (desktop.yml): launches it with
# a mateu:// link to handle, and passes only if the app REALLY works — read off idea.log by
# scripts/desktop-log-check.mjs: the plugin loaded, its self-check reached every library and platform
# module, the hub ("My UIs") showed, the link reached the hub, and no error is Mateu's (no "Plugin to
# blame: Mateu", no NoClassDefFoundError from Mateu's classloader). 3.0-beta.64 passed the old
# "the plugin loaded" check and its hub never came up (Jackson missing on the 2026.3 base).
#
#   scripts/desktop-smoke.sh macos <path to Mateu.app>
#   scripts/desktop-smoke.sh linux <unpacked linux bundle dir>   (run it under Xvfb: no display on CI)
# (Windows: the smoke-windows job of desktop.yml does the same in PowerShell, with the same log check.)
#
# The link is handed over through MATEU_OPEN_LINK (MateuProjectService): the hub handles it like one the
# OS opened, and only ASKS before calling that address — nothing is fetched.
#
# It never builds anything. Installers are built on CI ONLY (CLAUDE.md, #1000).
set -uo pipefail

platform="${1:?macos|linux}"
target="${2:?the packaged app}"
out="${RUNNER_TEMP:-${TMPDIR:-/tmp}}/mateu-smoke.out"
here="$(cd "$(dirname "$0")" && pwd)"
export MATEU_OPEN_LINK='mateu://add?u=https://smoke-test.mateu.invalid'
# The 2026.3 base's first-launch user agreement (a MODAL dialog — the event thread parks in AgreementUi)
# is skipped by the APP itself: desktopVmOptions bakes -Djb.privacy.policy.text into the launcher's
# vmoptions. The smoke sets nothing, so a build that lost that line hangs here instead of shipping.

case "$platform" in
  macos)
    exe=$(/usr/libexec/PlistBuddy -c 'Print :CFBundleExecutable' "$target/Contents/Info.plist")
    product=$(/usr/libexec/PlistBuddy -c 'Print :CFBundleName' "$target/Contents/Info.plist")
    log="$HOME/Library/Logs/$product/idea.log"
    rm -f "$log"
    # What this machine enforces: 3.0-beta.64 launched here and not on a user's Mac (a hardened
    # launcher refusing a library of another Team ID) — scripts/macos-signature-check.sh is the gate
    # for that; these lines tell how far a launch on this runner proves it.
    echo "--- $(csrutil status 2> /dev/null || echo 'csrutil: n/a')"
    echo "--- DisableLibraryValidation: $(defaults read /Library/Preferences/com.apple.security.libraryvalidation DisableLibraryValidation 2> /dev/null || echo unset)"
    since=$(date '+%Y-%m-%d %H:%M:%S')
    "$target/Contents/MacOS/$exe" > "$out" 2>&1 &
    ;;
  linux)
    target="${target%/}"
    log="$target/data/log/idea.log"
    rm -f "$log"
    grep -h '"buildNumber"\|"version"' "$target/product-info.json" | head -3
    if command -v xvfb-run > /dev/null; then xvfb-run -a sh "$target/mateu.sh" > "$out" 2>&1 &
    else sh "$target/mateu.sh" > "$out" 2>&1 &
    fi
    ;;
  *) echo "unknown platform $platform" >&2; exit 2 ;;
esac
pid=$!

# The launcher's own failures ("Cannot start the IDE", a library it cannot load) never reach idea.log:
# the native launcher shows a MODAL dialog and stays alive, so waiting for the log alone only fails
# after the whole timeout and says nothing of why. Read its output too, and stop at the first sign.
LAUNCH_FAILURE='Cannot start the IDE|Cannot start the runtime|Failed to load .libjli|dlopen failed|not valid for use in process|different Team IDs'
launch_failed=0
for _ in $(seq 1 48); do
  sleep 5
  # done: the link reached the hub (the last step), or Mateu already failed in a way the check reports
  grep -Eq 'Mateu hub: a link asks to add|Mateu self-check FAILED|Plugin to blame: Mateu' "$log" 2> /dev/null && break
  if grep -Eq "$LAUNCH_FAILURE" "$out" 2> /dev/null; then launch_failed=1; break; fi
  # macOS: $pid IS the IDE (the wrapper execs the native launcher, which runs the JVM in-process)
  if [[ "$platform" = macos ]] && ! kill -0 "$pid" 2> /dev/null; then launch_failed=1; break; fi
done
[[ "$launch_failed" = 1 ]] || sleep 20 # let the plugin's own startup run, so its errors would reach the log
if [[ "$platform" = macos ]]; then
  # A refused library is logged by the kernel (AMFI / library validation), not by the app.
  refused=$(log show --style compact --start "$since" --predicate 'eventMessage CONTAINS "Team ID" OR eventMessage CONTAINS "Library Validation"' 2> /dev/null \
    | grep -F "$target" | head -5)
  if [[ -n "$refused" ]]; then echo "--- the system refused code of the app:"; echo "$refused"; launch_failed=1; fi
fi
# Linux: when Mateu never got as far as the hub link, say WHERE the app stands before it is killed —
# a modal dialog (an agreement, an import prompt) leaves idea.log silent, and only the event thread tells.
if ! grep -q 'Mateu hub: a link asks to add' "$log" 2> /dev/null; then
  if [[ "$platform" = macos ]]; then jcmd="$target/Contents/jbr/Contents/Home/bin/jcmd"; procs=$pid
  else jcmd="$target/jbr/bin/jcmd"; procs=$(pgrep -f "$target/jbr" 2> /dev/null); fi
  for p in $procs; do
    echo "--- event thread of $p"
    "$jcmd" "$p" Thread.print 2> /dev/null \
      | awk '/^"AWT-EventQueue/{on=1} on&&/^$/{exit} on' | head -60
  done
  echo "--- idea.log (last 40 lines)"; tail -40 "$log" 2> /dev/null || true
fi
kill "$pid" 2> /dev/null || true
# Every process of the app — but not this script, whose own command line names the app too.
for p in $(pgrep -f "$target" 2> /dev/null); do
  [[ "$p" = "$$" ]] || [[ "$p" = "$PPID" ]] || kill "$p" 2> /dev/null || true
done

echo "--- idea.log (selected)"
grep -E 'IDE: |Loaded custom plugins|Mateu self-check|Mateu hub|io\.mateu|ERROR|SEVERE' "$log" 2> /dev/null | head -60 || true
if [[ "$launch_failed" = 0 ]] && node "$here/desktop-log-check.mjs" "$log" --hub --link; then
  msg="✅ $platform: $(grep -m1 -o 'IDE: .*' "$log") — Mateu loaded, hub up, link handled, no Mateu error ($target)"
  echo "$msg"
  [[ -n "${GITHUB_STEP_SUMMARY:-}" ]] && echo "$msg" >> "$GITHUB_STEP_SUMMARY"
  exit 0
fi
if [[ "$launch_failed" = 1 ]]; then echo "❌ $platform: the app did not start ($target)"
else echo "❌ $platform: the app started but does not work — see the errors above ($target)"; fi
echo "--- launcher output"; tail -50 "$out" 2> /dev/null || true
exit 1
