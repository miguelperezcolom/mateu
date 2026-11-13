#!/bin/bash
# Static check of how a PACKAGED Mateu desktop .app is signed — the failures that make a hardened app
# refuse to start, found WITHOUT launching it (a CI runner may not enforce what a user's Mac does):
#
#   scripts/macos-signature-check.sh <path to .app>
#
#  - the signature verifies (codesign --verify --deep --strict);
#  - EVERY Mach-O in the bundle carries the app's Team ID — a hardened process loads only libraries of
#    its own Team ID unless it has disable-library-validation; 3.0-beta.64 shipped the JBR still signed
#    by JetBrains under a launcher signed by us, and died on "Failed to load libjli.dylib … different
#    Team IDs";
#  - every hardened launcher (Contents/MacOS) and the bundled JVM keep the JVM's entitlements: allow-jit
#    (no JIT → the JVM cannot run) and disable-library-validation (it loads JetBrains-signed natives
#    from the plugins' jars and native libraries extracted at run time).
# Used by desktop.yml on the files it publishes (the zip's and the dmg's .app). It never builds anything.
set -uo pipefail
export LC_ALL=C # `file` describes fonts etc. with bytes that are not UTF-8: a UTF-8 awk dies on them mid-list

app="${1:?path to the .app}"
app="${app%/}"
[[ -d "$app/Contents" ]] || { echo "::error::not an app bundle: $app"; exit 2; }
fail=0
err() { echo "::error::$*"; fail=1; }

team_of() { codesign -dv "$1" 2>&1 | sed -n 's/^TeamIdentifier=//p' | head -1; }
flags_of() { codesign -dv "$1" 2>&1 | sed -n 's/.*flags=[^(]*(\([^)]*\)).*/\1/p' | head -1; }
entitlements_of() { codesign -d --entitlements - --xml "$1" 2>/dev/null || true; }

echo "== $app"
codesign --verify --deep --strict "$app" || err "codesign: the signature of $app is invalid"
app_team=$(team_of "$app")
echo "App Team ID: ${app_team:-?}"

# Same Mach-O selection as installer/macos/sign-app.sh.
files=()
while IFS= read -r f; do files+=("$f"); done < <(
  find "$app" -type f ! -name '*.jar' ! -name '*.class' -print0 \
    | xargs -0 file -N -F ' :::: ' \
    | awk '{ i = index($0, " :::: "); n = substr($0, 1, i - 1); d = substr($0, i + 6) }
           i > 0 && n !~ / \(for architecture [^)]*\)$/ && d ~ /Mach-O/ && d !~ /object|dSYM|core/ { print n }')
echo "Mach-O files: ${#files[@]}"
[[ "${#files[@]}" -gt 0 ]] || err "no Mach-O file found in $app"

foreign=0
for f in ${files[@]+"${files[@]}"}; do
  t=$(team_of "$f")
  if [[ "$t" != "$app_team" ]]; then
    foreign=$((foreign + 1))
    [[ "$foreign" -le 20 ]] && echo "  other Team ID (${t:-unsigned}): ${f#"$app"/}"
  fi
done
[[ "$foreign" -eq 0 ]] || err "$foreign Mach-O file(s) are not signed with the app's Team ID ($app_team) — a hardened launcher refuses to load them (3.0-beta.64: 'Failed to load libjli.dylib … different Team IDs'). Sign inside-out (installer/macos/sign-app.sh), never with --deep."

# The processes that start a JVM: the Mach-O launchers in Contents/MacOS and the JBR's java.
launchers=()
for f in ${files[@]+"${files[@]}"}; do
  case "$f" in
    "$app/Contents/MacOS/"* | */Contents/Home/bin/java) launchers+=("$f") ;;
  esac
done
[[ "${#launchers[@]}" -gt 0 ]] || err "no Mach-O launcher in Contents/MacOS"
for f in ${launchers[@]+"${launchers[@]}"}; do
  flags=$(flags_of "$f")
  ents=$(entitlements_of "$f")
  echo "  launcher ${f#"$app"/}: flags=(${flags:-none})"
  case ",$flags," in
    *,runtime,*)
      for e in com.apple.security.cs.allow-jit com.apple.security.cs.disable-library-validation; do
        echo "$ents" | grep -q "$e" || err "${f#"$app"/} runs with the hardened runtime but lacks $e — the JVM will not start (the re-sign dropped JetBrains' entitlements: sign with --preserve-metadata=entitlements)"
      done
      echo "$ents" | grep -q com.apple.security.cs.allow-unsigned-executable-memory \
        || echo "::warning::${f#"$app"/} lacks allow-unsigned-executable-memory (JetBrains' launcher has it)"
      ;;
  esac
done

if [[ "$fail" -eq 0 ]]; then echo "✅ signature check: $app"; else echo "❌ signature check: $app"; fi
exit "$fail"
