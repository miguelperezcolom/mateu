#!/usr/bin/env bash
# Builds and tests every lab's start/ and solution/ project in the three languages, so the workshop
# does not rot. Against the PUBLISHED release the labs pin (Maven Central, NuGet, PyPI) — exactly
# what an attendee downloads.
#
#   workshop/verify.sh                 # everything it finds a toolchain for
#   workshop/verify.sh java            # one track: java | dotnet | python | shared
#   WORKSHOP_SKIP_CHECK=1 workshop/verify.sh   # skip "the committed labs are what the starters generate"
#
# Needs: JDK 21+ and Maven 3.9 (java, shared), the .NET 10 SDK (dotnet), Python 3.11+ (python), and
# Node 20+ with the VS Code extension compiled for the freshness check
# ((cd frontend/app/vscode-extension && npm ci && npm run compile)).
# A track whose toolchain is missing is reported as SKIPPED, never as passed.
set -uo pipefail
cd "$(dirname "$0")"
WS=$(pwd)
only=${1:-all}
results=()
failed=0

run() { # name, dir, command...
  local name=$1 dir=$2; shift 2
  echo "::group::$name"
  if (cd "$dir" && "$@"); then results+=("PASS  $name"); else results+=("FAIL  $name"); failed=1; fi
  echo "::endgroup::"
}
skip() { results+=("SKIP  $1 ($2)"); }
want() { [[ $only == all || $only == "$1" ]]; }

# 0. The committed projects are what the starters + the step overlays generate today.
if [[ -z ${WORKSHOP_SKIP_CHECK:-} ]]; then
  if [[ -f ../frontend/app/vscode-extension/out/newProject.js ]]; then
    run "labs are generated from the starters" "$WS" node tools/build-labs.mjs --check
  else
    skip "labs are generated from the starters" "VS Code extension not compiled"
  fi
fi

projects() { # lab language → the start/solution dirs present
  for kind in start solution; do [[ -d labs/$1/$2/$kind ]] && echo "labs/$1/$2/$kind"; done
}

# 1. Java: compile, run the UI tests (mateu-test), package.
if want java; then
  if command -v mvn >/dev/null; then
    for lab in 01-first-app 02-renderers 03-test-like-a-user 05-ai-agents 06-sign-in; do
      for p in $(projects $lab java); do run "java $p" "$p" mvn -B -q verify; done
    done
  else skip java "mvn not found"; fi
fi

# 2. Shared (lab 04): the YAML-only UI bundles into static files, the static-safety check included.
if want shared; then
  if command -v mvn >/dev/null; then
    for kind in start solution; do
      run "shared labs/04-ui-as-data/$kind" "labs/04-ui-as-data/$kind" \
        bash -c 'mvn -B -q package && test -f target/mateu-bundle/index.html && test -f target/mateu-bundle/manifest.json'
    done
  else skip shared "mvn not found"; fi
fi

# 3. C#: build the app; run the UI tests (Mateu.AspNetCore.Testing) where the lab has them.
if want dotnet; then
  if command -v dotnet >/dev/null && dotnet --list-sdks | grep -q '^10\.'; then
    for lab in 01-first-app 03-test-like-a-user 05-ai-agents 06-sign-in; do
      for p in $(projects $lab dotnet); do
        if [[ -d $p/Workshop.Tests ]]; then run "dotnet $p" "$p" dotnet test Workshop.Tests -nologo -v q
        else run "dotnet $p" "$p" dotnet build -nologo -v q; fi
      done
    done
  else skip dotnet ".NET 10 SDK not found"; fi
fi

# 4. Python: a fresh virtualenv per project with its requirements.txt; pytest (mateu_ui.testing).
if want python; then
  py=$(command -v python3 || true)
  if [[ -n $py ]] && "$py" -c 'import sys; sys.exit(sys.version_info < (3, 11))'; then
    venvs=$(mktemp -d)
    for lab in 01-first-app 03-test-like-a-user 05-ai-agents 06-sign-in; do
      for p in $(projects $lab python); do
        v="$venvs/$(echo "$p" | tr '/' '_')"
        run "python $p" "$p" bash -c "'$py' -m venv '$v' && '$v/bin/pip' install -q -r requirements.txt && '$v/bin/python' -m pytest -q -p no:cacheprovider"
      done
    done
    rm -rf "$venvs"
  else skip python "Python 3.11+ not found"; fi
fi

echo
printf '%s\n' "${results[@]}"
exit $failed
