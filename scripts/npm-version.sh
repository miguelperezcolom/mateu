#!/usr/bin/env bash
# The npm version and dist-tag of the `mateu-vaadin` package for a release tag, as KEY=value lines
# (buid-and-publish.yml's `npm` job appends them to $GITHUB_ENV). The package follows the framework:
# the same release, the same number, spelled as SemVer (the NuGet mapping):
#
#   v3.0-beta.58 → NPM_VERSION=3.0.0-beta.58  NPM_TAG=latest
#   v3.0-rc.1    → NPM_VERSION=3.0.0-rc.1     NPM_TAG=latest
#   v3.0.0       → NPM_VERSION=3.0.0          NPM_TAG=latest
#   v3.0         → NPM_VERSION=3.0.0          NPM_TAG=latest
#   v3.1-rc.1    → NPM_VERSION=3.1.0-rc.1     NPM_TAG=next
#
# The 3.0 pre-releases go out as `latest`: the only `latest` before them is 0.0.15 (April 2026, from
# before the 3.0 betas), and `npm i mateu-vaadin` must not keep handing that out. A pre-release of a
# LATER minor or major goes out as `next`, so it never replaces the current release for anyone who
# did not ask for it. Any other tag (an alpha, a non-framework release) fails instead of guessing.
set -euo pipefail

tag="${1:?usage: npm-version.sh <release tag>}"
v="${tag#v}"
if [[ "$tag" != v* ]]; then
  echo "npm-version.sh: '$tag' is not a framework release" >&2
  exit 1
elif [[ "$v" =~ ^([0-9]+)\.([0-9]+)-(beta|rc)\.([0-9]+)$ ]]; then
  echo "NPM_VERSION=${BASH_REMATCH[1]}.${BASH_REMATCH[2]}.0-${BASH_REMATCH[3]}.${BASH_REMATCH[4]}"
  if [[ "$v" =~ ^3\.0- ]]; then echo "NPM_TAG=latest"; else echo "NPM_TAG=next"; fi
elif [[ "$v" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "NPM_VERSION=$v"
  echo "NPM_TAG=latest"
elif [[ "$v" =~ ^[0-9]+\.[0-9]+$ ]]; then
  echo "NPM_VERSION=$v.0"
  echo "NPM_TAG=latest"
else
  echo "npm-version.sh: no npm version for '$tag'" >&2
  exit 1
fi
