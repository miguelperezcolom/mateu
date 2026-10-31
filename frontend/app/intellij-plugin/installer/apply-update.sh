#!/bin/sh
# Applies a staged Mateu plugin update BEFORE the IDE starts (the running plugin is never replaced).
#
#   apply-update.sh <plugins dir> <update dir>
#
# The plugin (io.mateu.ijp.update.UpdateStaging) stages an update as
#   <update dir>/pending/{READY,version.txt,mateu-intellij-plugin/}
# renaming the whole dir into place with READY inside, so a pending dir without READY is a torn
# write and is ignored. The swap is two renames on one filesystem — installed plugin → previous,
# pending plugin → plugins dir — then previous is deleted; if the second rename fails the previous
# plugin is put back. A launch killed between the two renames is repaired by the next one.
# Always exits 0: a failed update must never keep the app from starting.

PLUGINS=$1
UPDATE=$2
NAME=mateu-intellij-plugin
PENDING=$UPDATE/pending
PREVIOUS=$UPDATE/previous

# Repair an interrupted swap: the installed plugin is gone but its copy was moved aside.
if [ ! -d "$PLUGINS/$NAME" ] && [ -d "$PREVIOUS" ]; then
  mkdir -p "$PLUGINS" && mv "$PREVIOUS" "$PLUGINS/$NAME"
fi

[ -f "$PENDING/READY" ] && [ -d "$PENDING/$NAME/lib" ] || exit 0

rm -rf "$PREVIOUS"
mkdir -p "$PLUGINS" || exit 0
if [ -d "$PLUGINS/$NAME" ]; then
  mv "$PLUGINS/$NAME" "$PREVIOUS" || exit 0
fi
if mv "$PENDING/$NAME" "$PLUGINS/$NAME" 2>/dev/null; then
  [ -f "$PENDING/version.txt" ] && cp "$PENDING/version.txt" "$UPDATE/applied.txt"
  rm -rf "$PREVIOUS" "$PENDING"
else
  echo "mateu: could not apply the staged update; keeping the installed plugin" >&2
  [ -d "$PREVIOUS" ] && mv "$PREVIOUS" "$PLUGINS/$NAME"
fi
exit 0
