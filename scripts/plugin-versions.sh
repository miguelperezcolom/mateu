#!/usr/bin/env bash
# The IDE plugins' versions for a release tag, as KEY=value lines (publish-plugins.yml appends them to
# $GITHUB_ENV). The plugins follow the framework: the framework's release tag publishes them too.
#
#   v3.0-beta.9     → INTELLIJ_VERSION=3.0-beta.9  VSCODE_VERSION=2.99.9
#   v3.0.0 / v3.0   → INTELLIJ_VERSION=3.0.0/3.0   VSCODE_VERSION=3.0.0
#   v3.0.1          → INTELLIJ_VERSION=3.0.1       VSCODE_VERSION=3.0.1
#   plugins-v0.2.17 → both 0.2.17                  (the old dedicated plugin releases)
#
# JetBrains Marketplace takes the framework's version as it is. The VS Code Marketplace and Open VSX
# take only major.minor.patch numbers, and only ever a HIGHER one than the last published. So a beta
# of X.0 is published BELOW X.0.0 — (X-1).99.N — and from the GA on every version is the framework's
# own, unchanged. (Mapping beta.N to X.0.N would have made X.0.1 lower than the last beta: rejected.)
# Published as an ordinary version, NOT --pre-release: a pre-release only reaches users who opted
# into that channel, and the extension's existing users would stop getting updates. A tag this
# script does not map (an alpha, an rc, a beta of a minor) fails the publish instead of guessing.
set -euo pipefail

tag="${1:?usage: plugin-versions.sh <release tag>}"
case "$tag" in
  plugins-v*)
    v="${tag#plugins-v}"
    echo "INTELLIJ_VERSION=$v"
    echo "VSCODE_VERSION=$v"
    ;;
  v*)
    v="${tag#v}"
    if [[ "$v" =~ ^([1-9][0-9]*)\.0-beta\.([0-9]+)$ ]]; then
      echo "INTELLIJ_VERSION=$v"
      echo "VSCODE_VERSION=$(( BASH_REMATCH[1] - 1 )).99.${BASH_REMATCH[2]}"
    elif [[ "$v" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
      echo "INTELLIJ_VERSION=$v"
      echo "VSCODE_VERSION=$v"
    elif [[ "$v" =~ ^[0-9]+\.[0-9]+$ ]]; then
      echo "INTELLIJ_VERSION=$v"
      echo "VSCODE_VERSION=$v.0"
    else
      echo "plugin-versions.sh: no plugin version for '$tag' (VS Code needs major.minor.patch above the last one published — see the mapping above)" >&2
      exit 1
    fi
    ;;
  *)
    echo "plugin-versions.sh: '$tag' is not a release the plugins follow" >&2
    exit 1
    ;;
esac
