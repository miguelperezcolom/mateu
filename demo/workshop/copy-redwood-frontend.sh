#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC="$SCRIPT_DIR/../../frontend/web/monorepo/apps/redwood-oj/dist"
DEST="$SCRIPT_DIR/fronts/redwood/src/main/resources/static"

if [ ! -d "$SRC" ]; then
  echo "Error: source directory not found: $SRC"
  exit 1
fi

rm -rf "$DEST"/*
cp -r "$SRC"/. "$DEST"/
sed -i 's|ui.setAttribute("baseUrl", "");|ui.setAttribute("baseUrl", "http://localhost:8301");|g' "$DEST/js/demo.js"
echo "Copied $SRC -> $DEST"
