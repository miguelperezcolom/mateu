#!/bin/sh
# Mateu desktop launcher (Linux): applies a staged update, then opens the bundled workspace.
# Arguments go through to the IDE (a mateu:// link from the desktop entry).
#
# A restart from inside the app ("Restart to update", or any IDE restart) EXITS with 88 instead of
# relaunching the IDE binary directly (IDEA_RESTART_VIA_EXIT_CODE, read by the platform's
# Restarter), so the relaunch goes through here and the update is applied first. The arguments
# are not repeated on a restart: a link is handled once.
DIR="$(cd "$(dirname "$0")" && pwd)"
export IDEA_RESTART_VIA_EXIT_CODE=88

sh "$DIR/apply-update.sh" "$DIR/data/plugins" "$DIR/data/mateu-update"
"$DIR/bin/idea.sh" "$DIR/workspace" "$@"
status=$?
while [ "$status" -eq 88 ]; do
  sh "$DIR/apply-update.sh" "$DIR/data/plugins" "$DIR/data/mateu-update"
  "$DIR/bin/idea.sh" "$DIR/workspace"
  status=$?
done
exit "$status"
