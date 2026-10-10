#!/usr/bin/env bash
# Path filter for workflows that must ALWAYS report a check (so it can be required on master) but
# only do real work when the PR touches certain paths. Writes `relevant=true|false` to $GITHUB_OUTPUT.
#
# Env: EVENT (github.event_name), PR (pull request number), REPO (owner/name), PATTERN (an extended
# regex matched against each changed file path), GH_TOKEN (pull-requests: read).
#
# Anything that is not a pull request (push to master, release, manual dispatch) is always relevant.
# Fails OPEN: if the file list cannot be read, or the PR is at GitHub's 3000-file listing cap, the
# answer is "relevant" — running a job for nothing is cheap, skipping one that mattered is not.
set -uo pipefail

out="${GITHUB_OUTPUT:-/dev/stdout}"
answer() { echo "relevant=$1" >> "$out"; echo "relevant=$1 ($2)"; exit 0; }

[ "${EVENT:-}" = "pull_request" ] || answer true "event ${EVENT:-unknown}"
[ -n "${PR:-}" ] && [ -n "${REPO:-}" ] && [ -n "${PATTERN:-}" ] || answer true "missing PR/REPO/PATTERN"

if ! files=$(gh api --paginate "repos/$REPO/pulls/$PR/files?per_page=100" --jq '.[].filename'); then
  answer true "could not list the PR's files"
fi
count=$(printf '%s\n' "$files" | grep -c . || true)
[ "$count" -ge 3000 ] && answer true "$count files, at the listing cap"

if printf '%s\n' "$files" | grep -Eq -- "$PATTERN"; then
  answer true "matched: $(printf '%s\n' "$files" | grep -E -- "$PATTERN" | head -3 | tr '\n' ' ')"
fi
answer false "none of the $count changed files matches $PATTERN"
