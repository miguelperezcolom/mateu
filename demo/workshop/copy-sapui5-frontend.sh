#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC="$SCRIPT_DIR/../../frontend/web/monorepo/apps/sapui5/dist"
DEST="$SCRIPT_DIR/fronts/sapui5/src/main/resources/static"

if [ ! -d "$SRC" ]; then
  echo "Error: source directory not found: $SRC"
  exit 1
fi

rm -rf "$DEST"/*
cp -r "$SRC"/. "$DEST"/
sed -i 's|<mateu-ui baseUrl="https://demo.mateu.io"|<mateu-ui baseUrl="http://localhost:8301"|g' "$DEST/index.html"
echo "Copied $SRC -> $DEST"
