#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC="$SCRIPT_DIR/../../frontend/web/monorepo/apps/vaadin/dist"
DEST="$SCRIPT_DIR/fronts/vaadin/src/main/resources/static"

if [ ! -d "$SRC" ]; then
  echo "Error: source directory not found: $SRC"
  exit 1
fi

rm -rf "$DEST"/*
cp -r "$SRC"/. "$DEST"/
echo "Copied $SRC -> $DEST"
