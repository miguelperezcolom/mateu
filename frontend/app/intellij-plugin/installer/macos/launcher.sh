#!/bin/sh
# @PRODUCT@.app launcher (Contents/MacOS, the bundle's CFBundleExecutable): installs the bundled
# Mateu plugin into the custom plugins dir, applies a staged update, then opens the bundled
# workspace. A restart from inside the app relaunches the BUNDLE (`open -n`), so it runs this again —
# that is when "Restart to update" applies the update. Arguments (a mateu:// link) go through.
HERE="$(cd "$(dirname "$0")" && pwd)"
RES="$HERE/../Resources"
SUPPORT="${MATEU_SUPPORT_DIR:-$HOME/Library/Application Support/@PRODUCT@}"

# Pre-create the config dir so the first run skips the IDE "Import Settings" dialog, and turn the
# IDE's own update checks off (the app updates itself; see io.mateu.ijp.update).
[ -d "$SUPPORT/config/options" ] || mkdir -p "$SUPPORT/config/options"
[ -f "$SUPPORT/config/options/updates.xml" ] || cp "$RES/updates.xml" "$SUPPORT/config/options/updates.xml"

# First run, or an app (re)installed with another bundled plugin: the bundled plugin replaces the
# installed one, and an update staged for the previous app is dropped.
BUNDLED="$(cat "$RES/mateu-plugin-version.txt" 2>/dev/null)"
if [ ! -d "$SUPPORT/plugins/mateu-intellij-plugin" ] || [ "$(cat "$SUPPORT/mateu-update/bundled.txt" 2>/dev/null)" != "$BUNDLED" ]; then
  mkdir -p "$SUPPORT/plugins" "$SUPPORT/mateu-update" &&
    rm -rf "$SUPPORT/plugins/mateu-intellij-plugin" "$SUPPORT/mateu-update/pending" "$SUPPORT/mateu-update/previous" &&
    cp -R "$RES/mateu-plugin/"* "$SUPPORT/plugins/" &&
    printf '%s\n' "$BUNDLED" > "$SUPPORT/mateu-update/bundled.txt"
fi

sh "$RES/apply-update.sh" "$SUPPORT/plugins" "$SUPPORT/mateu-update"
exec "$HERE/@EXEC@-original" "$RES/workspace" "$@"
