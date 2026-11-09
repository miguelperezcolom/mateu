#!/bin/sh
# Installs @PRODUCT@ for the CURRENT user (no root): copies this bundle to
# ~/.local/share/@SLUG@, adds it to the applications menu and, in the hub build, makes it the
# handler of mateu:// links. Run it again from a newer bundle to upgrade: the settings (data/config)
# and the workspace are kept; the IDE, the plugin and any staged update are replaced.
#
#   ./install.sh              install / upgrade
#   ./install.sh --uninstall  remove the app, its menu entry and the link handler
set -eu

SRC="$(cd "$(dirname "$0")" && pwd)"
DATA_HOME="${XDG_DATA_HOME:-$HOME/.local/share}"
DEST="$DATA_HOME/@SLUG@"
APPS="$DATA_HOME/applications"
ENTRY="$APPS/@SLUG@.desktop"
HUB=@HUB@

# The settings and workspace wait here during an upgrade: beside the install (a rename on one
# filesystem) and with a fixed name, so a run that dies never leaves them in a temp dir the next
# reboot clears, and the next run still finds them.
KEEP="$DEST.keep"

if [ "${1:-}" = "--uninstall" ]; then
  rm -f "$ENTRY"
  rm -rf "$DEST" "$KEEP"
  command -v update-desktop-database >/dev/null 2>&1 && update-desktop-database "$APPS" || true
  echo "@PRODUCT@ removed."
  exit 0
fi

restore_kept() {
  for d in data/config workspace; do
    if [ -d "$KEEP/$d" ]; then
      rm -rf "${DEST:?}/$d"
      mkdir -p "$DEST/$(dirname "$d")"
      mv "$KEEP/$d" "$DEST/$d"
    fi
  done
  rm -rf "$KEEP"
}

if [ "$SRC" != "$DEST" ]; then
  if [ -d "$DEST" ]; then
    for d in data/config workspace; do
      # already kept by a run that died: that copy is the user's, what is in $DEST is not
      if [ -d "$DEST/$d" ] && [ ! -e "$KEEP/$d" ]; then
        mkdir -p "$KEEP/$(dirname "$d")"
        mv "$DEST/$d" "$KEEP/$d"
      fi
    done
  fi
  # whatever happens from here on, the user's data goes back into the install
  trap restore_kept EXIT
  trap 'exit 130' INT TERM HUP
  rm -rf "$DEST"
  mkdir -p "$DEST"
  cp -R "$SRC/." "$DEST/"
  trap - EXIT INT TERM HUP
  restore_kept
fi

mkdir -p "$APPS"
sed "s|@INSTALL_DIR@|$DEST|g" "$DEST/@SLUG@.desktop" > "$ENTRY"
chmod +x "$DEST/mateu.sh" "$DEST/apply-update.sh"
command -v update-desktop-database >/dev/null 2>&1 && update-desktop-database "$APPS" || true
if [ "$HUB" = "true" ] && command -v xdg-mime >/dev/null 2>&1; then
  xdg-mime default "@SLUG@.desktop" x-scheme-handler/mateu || true
fi
echo "@PRODUCT@ installed in $DEST — find it in your applications menu, or run $DEST/mateu.sh"
