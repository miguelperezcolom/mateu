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

if [ "${1:-}" = "--uninstall" ]; then
  rm -f "$ENTRY"
  rm -rf "$DEST"
  command -v update-desktop-database >/dev/null 2>&1 && update-desktop-database "$APPS" || true
  echo "@PRODUCT@ removed."
  exit 0
fi

if [ "$SRC" != "$DEST" ]; then
  KEEP=""
  if [ -d "$DEST" ]; then
    KEEP="$(mktemp -d)"
    for d in data/config workspace; do
      if [ -d "$DEST/$d" ]; then
        mkdir -p "$KEEP/$(dirname "$d")"
        mv "$DEST/$d" "$KEEP/$d"
      fi
    done
    rm -rf "$DEST"
  fi
  mkdir -p "$DEST"
  cp -R "$SRC/." "$DEST/"
  if [ -n "$KEEP" ]; then
    for d in data/config workspace; do
      if [ -d "$KEEP/$d" ]; then
        rm -rf "${DEST:?}/$d"
        mkdir -p "$DEST/$(dirname "$d")"
        mv "$KEEP/$d" "$DEST/$d"
      fi
    done
    rm -rf "$KEEP"
  fi
fi

mkdir -p "$APPS"
sed "s|@INSTALL_DIR@|$DEST|g" "$DEST/@SLUG@.desktop" > "$ENTRY"
chmod +x "$DEST/mateu.sh" "$DEST/apply-update.sh"
command -v update-desktop-database >/dev/null 2>&1 && update-desktop-database "$APPS" || true
if [ "$HUB" = "true" ] && command -v xdg-mime >/dev/null 2>&1; then
  xdg-mime default "@SLUG@.desktop" x-scheme-handler/mateu || true
fi
echo "@PRODUCT@ installed in $DEST — find it in your applications menu, or run $DEST/mateu.sh"
