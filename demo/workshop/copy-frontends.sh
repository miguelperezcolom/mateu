#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

"$SCRIPT_DIR/copy-vaadin-frontend.sh" && "$SCRIPT_DIR/copy-redwood-frontend.sh" && "$SCRIPT_DIR/copy-sapui5-frontend.sh"
