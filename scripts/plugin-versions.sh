#!/usr/bin/env bash
# The IDE plugins' versions for a release tag, as KEY=value lines (publish-plugins.yml appends them to
# $GITHUB_ENV). The plugins follow the framework: the framework's release tag publishes them too.
#
#   v3.0-beta.9     → INTELLIJ_VERSION=3.0-beta.9  VSCODE_VERSION=3.0.9
#   v3.0.10         → INTELLIJ_VERSION=3.0.10      VSCODE_VERSION=3.0.10
#   plugins-v0.2.17 → both 0.2.17                  (the old dedicated plugin releases)
#
# JetBrains Marketplace takes the framework's version as it is. The VS Code Marketplace and Open VSX
# take only major.minor.patch numbers, so a beta becomes its patch number there. It is published as
# an ordinary version, NOT --pre-release: a pre-release only reaches users who opted into that
# channel, and the extension's existing users would stop getting updates. Patch numbers only grow,
# so the GA must stay above the last beta (e.g. v3.0.10 after v3.0-beta.9) — a tag this script does
# not map fails the publish instead of guessing.
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
    if [[ "$v" =~ ^([0-9]+)\.([0-9]+)-beta\.([0-9]+)$ ]]; then
      echo "INTELLIJ_VERSION=$v"
      echo "VSCODE_VERSION=${BASH_REMATCH[1]}.${BASH_REMATCH[2]}.${BASH_REMATCH[3]}"
    elif [[ "$v" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
      echo "INTELLIJ_VERSION=$v"
      echo "VSCODE_VERSION=$v"
    else
      echo "plugin-versions.sh: no plugin version for '$tag' (VS Code needs major.minor.patch above the last one published)" >&2
      exit 1
    fi
    ;;
  *)
    echo "plugin-versions.sh: '$tag' is not a release the plugins follow" >&2
    exit 1
    ;;
esac
