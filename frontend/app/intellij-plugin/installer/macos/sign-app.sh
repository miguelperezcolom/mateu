#!/bin/bash
# Re-signs a rebranded IntelliJ .app INSIDE-OUT, every piece of code with ONE identity:
#
#   installer/macos/sign-app.sh <path to .app> <identity>   ("-" = ad-hoc)
#
# Called by buildInstaller (build.gradle.kts) after the bundle was modified. It never builds anything.
#
# Why not `codesign --force --deep` (what 3.0-beta.64 shipped, and why it did not start: "Failed to
# load libjli.dylib … mapping process and mapped file (non-platform) have different Team IDs"):
#  1. --deep only reaches nested code in the STANDARD places (Contents/MacOS, Frameworks, PlugIns…).
#     The JBR lives in Contents/jbr and the JCEF helpers under Contents/plugins — --deep leaves them
#     with JetBrains' signature (Team ID 2ZEFAR8TH3) while the launcher gets ours.
#  2. --force signs WITHOUT entitlements unless told otherwise, so JetBrains' launcher and java lost
#     theirs (allow-jit, allow-unsigned-executable-memory, disable-library-validation…). A hardened
#     process without disable-library-validation loads only libraries of its own Team ID → the
#     launcher refused the JBR's libjli.dylib.
# So: every Mach-O file is re-signed with our identity, KEEPING the entitlements JetBrains gave that
# very binary (--preserve-metadata=entitlements — what IntelliJ's own launcher, java and the JCEF
# helpers need), then every nested bundle from the deepest out, then the app. No --deep anywhere.
# The result is checked by scripts/macos-signature-check.sh on CI.
set -euo pipefail
export LC_ALL=C # `file` describes fonts etc. with bytes that are not UTF-8: a UTF-8 awk dies on them mid-list

app="${1:?path to the .app}"
identity="${2:?signing identity, or - for ad-hoc}"
app="${app%/}"
[ -d "$app/Contents" ] || { echo "not an app bundle: $app" >&2; exit 2; }

opts=(--force --preserve-metadata=entitlements --sign "$identity")
# A Developer ID needs the hardened runtime + a secure timestamp (notarization requires both).
# Ad-hoc keeps the old local behaviour: no runtime, no timestamp (no network).
if [ "$identity" != "-" ]; then opts+=(--options runtime --timestamp); fi

# Every regular (non-symlink) Mach-O that is code: executables, dylibs, loadable bundles. Object files
# and dSYM companions are not signed.
macho_files() {
  find "$1" -type f ! -name '*.jar' ! -name '*.class' -print0 \
    | xargs -0 file -N -F ' :::: ' \
    | awk '{ i = index($0, " :::: "); n = substr($0, 1, i - 1); d = substr($0, i + 6) }
           # a universal binary also gets one "<name> (for architecture x)" line per slice: skip those
           i > 0 && n !~ / \(for architecture [^)]*\)$/ && d ~ /Mach-O/ && d !~ /object|dSYM|core/ { print n }'
}

# Nested code bundles (helpers, frameworks, plug-ins), deepest first, the app itself excluded.
nested_bundles() {
  find "$1" -mindepth 1 -type d \( -name '*.app' -o -name '*.framework' -o -name '*.bundle' -o -name '*.xpc' -o -name '*.appex' -o -name '*.plugin' \) -print \
    | awk -F/ '{ print NF "\t" $0 }' | sort -rn -k1,1 | cut -f2-
}

files=()
while IFS= read -r f; do files+=("$f"); done < <(macho_files "$app")
[ "${#files[@]}" -gt 0 ] || { echo "no Mach-O file in $app" >&2; exit 1; }
echo "Signing ${#files[@]} Mach-O files…"
# Deepest first, so a file inside a nested bundle is signed before that bundle is.
sorted=()
while IFS= read -r f; do sorted+=("$f"); done < <(printf '%s\n' "${files[@]}" | awk -F/ '{ print NF "\t" $0 }' | sort -rn -k1,1 | cut -f2-)
batch=()
for f in "${sorted[@]}"; do
  batch+=("$f")
  if [ "${#batch[@]}" -ge 50 ]; then codesign "${opts[@]}" "${batch[@]}"; batch=(); fi
done
if [ "${#batch[@]}" -gt 0 ]; then codesign "${opts[@]}" "${batch[@]}"; fi

bundles=()
while IFS= read -r b; do bundles+=("$b"); done < <(nested_bundles "$app")
echo "Signing ${#bundles[@]} nested bundles…"
for b in ${bundles[@]+"${bundles[@]}"}; do
  # only a real code bundle (a folder merely NAMED *.bundle with no Info.plist is a resource folder)
  if [ -f "$b/Contents/Info.plist" ] || [ -f "$b/Resources/Info.plist" ] || [ -e "$b/Versions/Current" ]; then
    codesign "${opts[@]}" "$b"
  fi
done

echo "Signing the app…"
codesign "${opts[@]}" "$app"
codesign --verify --deep --strict "$app"
echo "Signed: $app"
