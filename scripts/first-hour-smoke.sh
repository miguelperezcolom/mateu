#!/usr/bin/env bash
# "First hour" smoke against what was PUBLISHED: generate a fresh project from a released Mateu
# version with the New Project generator (the engine behind the IntelliJ wizard, the VS Code command
# and — for `archetype` — the io.mateu:mateu-archetype on Maven Central), build it against the public
# registries ONLY (Maven Central, PyPI, NuGet; a throwaway local repository, no user settings, no
# snapshot), start it, walk it in headless Chromium (e2e/first-hour-probe.mjs: home renders, the
# products listing opens, a create round trip works, no page errors) and stop it.
#
#   scripts/first-hour-smoke.sh --version 3.0-beta.1 --runtime spring-mvc
#   scripts/first-hour-smoke.sh --version 3.0-beta.1 --runtime all --maven-repo ~/.m2/repo-smoke
#
# Targets (--runtime, comma-separated or `all`):
#   spring-mvc spring-webflux quarkus micronaut helidon-mp dotnet python   the code flavour, default sample
#   yaml       the YAML-only flavour (Spring Boot MVC)
#   static     the static flavour (a bundle served by a plain static server)
#   archetype  mvn archetype:generate io.mateu:mateu-archetype (code flavour), then as spring-mvc
#
# Options:
#   --version V        the released Mateu version (Maven spelling, e.g. 3.0-beta.1). Required.
#   --port P           first port to use (default 21200); target i listens on P+i
#   --workdir D        where projects, logs and repositories go (default: a fresh temp dir)
#   --maven-repo D     Maven local repository (default: <workdir>/m2, empty = resolves from Central)
#   --wait M           wait up to M minutes for the registries to serve V (default 0 = check once)
#   --keep             leave the work dir behind
#   --only-wait        only wait for the registries; exit 0 when some target is servable, else 3
#   --available-out F  write the servable targets (space-separated) to F
#
# Needs: JDK 21 + Maven (Java targets), .NET SDK 8 (dotnet), Python >= 3.11 (python; or $PYTHON),
# Node >= 20 and the Playwright Chromium (`cd e2e && npx playwright install chromium`).
#
# Exit codes: 0 every target passed · 1 a target failed · 2 usage · 3 no failure, but some target
# (or all) was not tested because its registry does not serve V after --wait — the release workflow
# reports that as a warning, never as a red run.
set -uo pipefail

# Everything runs inside main(): bash parses a function whole before running it, so editing this
# file while a smoke is running cannot change what the running one executes.
main() {

ROOT=$(cd "$(dirname "$0")/.." && pwd)
GEN_DIR=$ROOT/frontend/app/vscode-extension
E2E_DIR=$ROOT/e2e
ALL="spring-mvc spring-webflux quarkus micronaut helidon-mp dotnet python yaml static archetype"

VERSION='' TARGETS='' PORT=21200 WORK='' MAVEN_REPO='' WAIT=0 KEEP=0 ONLY_WAIT=0 AVAILABLE_OUT=''
START_TIMEOUT=${START_TIMEOUT:-180}
usage() { sed -n '2,33p' "$0" | sed 's/^# \{0,1\}//'; }
while [[ $# -gt 0 ]]; do
  case $1 in
    --version) VERSION=$2; shift 2 ;;
    --runtime) TARGETS=$2; shift 2 ;;
    --port) PORT=$2; shift 2 ;;
    --workdir) WORK=$2; shift 2 ;;
    --maven-repo) MAVEN_REPO=$2; shift 2 ;;
    --wait) WAIT=$2; shift 2 ;;
    --keep) KEEP=1; shift ;;
    --only-wait) ONLY_WAIT=1; shift ;;
    --available-out) AVAILABLE_OUT=$2; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown option $1"; usage; exit 2 ;;
  esac
done
[[ -n $VERSION ]] || { echo "--version is required"; usage; exit 2; }
VERSION=${VERSION#v}
[[ -z $TARGETS || $TARGETS == all ]] && TARGETS=$ALL
TARGETS=${TARGETS//,/ }
for t in $TARGETS; do [[ " $ALL " == *" $t "* ]] || { echo "Unknown runtime '$t' (one of: $ALL)"; exit 2; }; done

if [[ -z $WORK ]]; then WORK=$(mktemp -d "${TMPDIR:-/tmp}/first-hour.XXXXXX"); fi
mkdir -p "$WORK"; WORK=$(cd "$WORK" && pwd)
MAVEN_REPO=${MAVEN_REPO:-$WORK/m2}
# No user settings (mirrors, private repositories, credentials): Maven Central only.
printf '<settings/>\n' > "$WORK/settings.xml"
MVN=(mvn -B -ntp -s "$WORK/settings.xml" -Dmaven.repo.local="$MAVEN_REPO")

PIDS=()
cleanup() {
  for p in "${PIDS[@]:-}"; do [[ -n $p ]] && kill "$p" 2>/dev/null; done
  wait 2>/dev/null
  [[ $KEEP == 1 ]] || rm -rf "$WORK"
}
trap cleanup EXIT

log() { echo "[$(date +%H:%M:%S)] $*"; }

# ------------------------------------------------------------------ the generator and the probe
if [[ ! -f $GEN_DIR/out/newProject.js ]]; then
  log "Compiling the New Project generator (frontend/app/vscode-extension)"
  (cd "$GEN_DIR" && npm ci --ignore-scripts --no-audit --no-fund >/dev/null && npm run -s compile) || { echo "Could not compile the generator"; exit 1; }
fi
if [[ ! -d $E2E_DIR/node_modules/playwright ]]; then
  log "Installing the e2e dependencies (Playwright)"
  (cd "$E2E_DIR" && npm ci --no-audit --no-fund >/dev/null) || { echo "Could not install e2e/"; exit 1; }
fi
np() { node -e "const np=require('$GEN_DIR/out/newProject.js'); console.log(np.$1('$VERSION'))"; }
NUGET_VERSION=$(np nugetVersion)
PYPI_VERSION=$(np pypiVersion)

# ------------------------------------------------------------------ are the registries serving V?
central() { curl -fsIL -o /dev/null "https://repo1.maven.org/maven2/io/mateu/$1/$VERSION/$1-$VERSION.${2:-pom}"; }
pypi() { curl -fsL -o /dev/null "https://pypi.org/pypi/mateu-ui/$PYPI_VERSION/json"; }
nuget() {
  local v; v=$(echo "$NUGET_VERSION" | tr '[:upper:]' '[:lower:]')
  for p in mateu.aspnetcore mateu.uidl; do
    curl -fsIL -o /dev/null "https://api.nuget.org/v3-flatcontainer/$p/$v/$p.$v.nupkg" || return 1
  done
}
# served <target>: are the artifacts this target resolves on the registries? The web renderer
# (mateu-vaadin) comes from Central for every target, the .NET/Python ones serve it too.
served() {
  central mateu-bom && central mateu-vaadin jar || return 1
  case $1 in
    archetype) central mateu-archetype jar ;;
    python) pypi ;;
    dotnet) nuget ;;
  esac
}
registry_of() {
  case $1 in python) echo "PyPI mateu-ui==$PYPI_VERSION" ;; dotnet) echo "NuGet Mateu.AspNetCore $NUGET_VERSION" ;;
    archetype) echo "Maven Central io.mateu:mateu-archetype:$VERSION" ;; *) echo "Maven Central io.mateu:mateu-bom:$VERSION" ;; esac
}
# Wait (bounded) until every target is servable; then test the servable ones and report the rest.
deadline=$(( $(date +%s) + WAIT * 60 ))
while :; do
  AVAILABLE=() UNPUBLISHED=()
  for t in $TARGETS; do if served "$t"; then AVAILABLE+=("$t"); else UNPUBLISHED+=("$t"); fi; done
  [[ ${#UNPUBLISHED[@]} -eq 0 ]] && break
  (( $(date +%s) >= deadline )) && break
  log "Waiting for the registries to serve $VERSION (still missing for: ${UNPUBLISHED[*]})"
  sleep 60
done
for t in "${UNPUBLISHED[@]:-}"; do [[ -n $t ]] && echo "NOT PUBLISHED  $t: $(registry_of "$t") is not served (yet)"; done
[[ -n $AVAILABLE_OUT ]] && echo "${AVAILABLE[*]:-}" > "$AVAILABLE_OUT"
[[ $ONLY_WAIT == 1 ]] && { [[ ${#AVAILABLE[@]} -gt 0 ]] && exit 0 || exit 3; }
[[ ${#AVAILABLE[@]} -gt 0 ]] || exit 3
log "Mateu $VERSION (NuGet $NUGET_VERSION, PyPI $PYPI_VERSION) — testing: ${AVAILABLE[*]}. Work dir: $WORK"

UI_JAR=$WORK/mateu-vaadin-$VERSION.jar
ui_jar() {
  [[ -f $UI_JAR ]] || curl -fsSL -o "$UI_JAR" "https://repo1.maven.org/maven2/io/mateu/mateu-vaadin/$VERSION/mateu-vaadin-$VERSION.jar"
}

pick_python() {
  for p in ${PYTHON:-} python3.13 python3.12 python3.11 python3; do
    command -v "$p" >/dev/null 2>&1 && "$p" -c 'import sys; sys.exit(sys.version_info < (3, 11))' 2>/dev/null && { echo "$p"; return; }
  done
}

# ------------------------------------------------------------------ one target
# generate <target> <dir>: the project, as a user gets it.
generate() {
  local t=$1 dir=$2 art="smoke-$1"
  case $t in
    archetype)
      mkdir -p "$dir.parent"
      (cd "$dir.parent" && "${MVN[@]}" org.apache.maven.plugins:maven-archetype-plugin:3.3.1:generate \
        -DarchetypeGroupId=io.mateu -DarchetypeArtifactId=mateu-archetype -DarchetypeVersion="$VERSION" \
        -DgroupId=com.example -DartifactId="$art" -Dversion=1.0.0-SNAPSHOT -Dpackage=com.example.smoke \
        -DinteractiveMode=false) && mv "$dir.parent/$art" "$dir" ;;
    yaml|static)
      node "$GEN_DIR/scripts/new-project.mjs" --authoring "$t" --runtime spring-mvc --artifact "$art" --version "$VERSION" --out "$dir" ;;
    *)
      node "$GEN_DIR/scripts/new-project.mjs" --authoring code --runtime "$t" --artifact "$art" --version "$VERSION" --out "$dir" ;;
  esac
}

# build <target> <dir>: against the public registries only.
build() {
  local t=$1 dir=$2
  case $t in
    dotnet)
      # nuget.org only (no user/machine feeds), into a package folder of our own.
      cat > "$dir/nuget.config" <<'EOF'
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <packageSources>
    <clear />
    <add key="nuget.org" value="https://api.nuget.org/v3/index.json" />
  </packageSources>
</configuration>
EOF
      (cd "$dir" && NUGET_PACKAGES=$WORK/nuget dotnet build -c Release --nologo) ;;
    python)
      local py; py=$(pick_python)
      [[ -n $py ]] || { echo "No Python >= 3.11 found (set PYTHON)"; return 1; }
      "$py" -m venv "$dir/.venv" && (cd "$dir" && PIP_CONFIG_FILE=/dev/null .venv/bin/pip install -q --no-cache-dir \
        --index-url https://pypi.org/simple -r requirements.txt) ;;
    *)
      (cd "$dir" && "${MVN[@]}" package -DskipTests) ;;
  esac
}

# start <target> <dir> <port>: run in the background (`start … &`), so it already is a subshell:
# it cd's and EXECs the server, which keeps $! the server's own pid — a nested ( … ) would leave
# the server running when that pid is killed.
start() {
  local t=$1 dir=$2 p=$3 art="smoke-$1"
  case $t in
    spring-mvc|spring-webflux|yaml|archetype) cd "$dir" && exec java -jar "target/$art-1.0.0-SNAPSHOT.jar" --server.port="$p" ;;
    quarkus) cd "$dir" && exec java -Dquarkus.http.port="$p" -jar target/quarkus-app/quarkus-run.jar ;;
    micronaut) cd "$dir" && exec java -Dmicronaut.server.port="$p" -jar "target/$art-1.0.0-SNAPSHOT.jar" ;;
    helidon-mp) cd "$dir" && exec java -Dserver.port="$p" -jar "target/$art.jar" ;;
    dotnet)
      local dll; dll=$(cd "$dir" && ls bin/Release/net*/*.dll | grep -v -e Mateu -e '/Microsoft' | while read -r f; do [[ -f ${f%.dll}.runtimeconfig.json ]] && echo "$f"; done | head -1)
      cd "$dir" && MATEU_UI=$UI_JAR exec dotnet "$dll" --urls "http://localhost:$p" ;;
    python) cd "$dir" && MATEU_UI=$UI_JAR exec .venv/bin/uvicorn main:app --host localhost --port "$p" ;;
    static)
      # What `npx serve -s target/mateu-bundle` does: the files, and index.html for any other path.
      cd "$dir/target/mateu-bundle" && exec node -e '
        const http=require("http"),fs=require("fs"),path=require("path");
        const types={".html":"text/html",".js":"text/javascript",".mjs":"text/javascript",".css":"text/css",".json":"application/json",".svg":"image/svg+xml",".png":"image/png",".woff2":"font/woff2",".yaml":"text/yaml"};
        http.createServer((q,r)=>{let f=path.join(process.cwd(),decodeURIComponent(new URL(q.url,"http://x").pathname));
          if(!f.startsWith(process.cwd())||!fs.existsSync(f)||fs.statSync(f).isDirectory())f=path.join(process.cwd(),"index.html");
          r.writeHead(200,{"Content-Type":types[path.extname(f)]||"application/octet-stream"});fs.createReadStream(f).pipe(r)}).listen(+process.argv[1],"localhost")' "$p" ;;
  esac
}

# The code flavours carry the Product CRUD; yaml/static carry a read-only listing over sample data.
crud_of() { case $1 in yaml|static) ;; *) echo --crud ;; esac; }

run_target() {
  local t=$1 p=$2 dir=$WORK/$1 logs=$WORK/logs/$1
  mkdir -p "$logs"
  local phase
  fail() {
    echo "FAIL  $t: $phase failed — last lines of $logs/$phase.log:"
    tail -60 "$logs/$phase.log" | sed 's/^/      /'
    if [[ $phase == probe && -f $logs/start.log ]]; then echo "      --- app log:"; tail -60 "$logs/start.log" | sed 's/^/      /'; fi
    return 1
  }
  phase=generate; log "$t: generate";  generate "$t" "$dir" >"$logs/$phase.log" 2>&1 || { fail; return 1; }
  phase=build;    log "$t: build";     build "$t" "$dir" >"$logs/$phase.log" 2>&1 || { fail; return 1; }
  [[ $t == dotnet || $t == python ]] && { ui_jar || { echo "FAIL  $t: could not download mateu-vaadin $VERSION"; return 1; }; }
  phase=start;    log "$t: start on port $p"
  start "$t" "$dir" "$p" >"$logs/start.log" 2>&1 &
  local pid=$!; PIDS+=("$pid")
  local url="http://localhost:$p/" up=0 waited=0
  while (( waited < START_TIMEOUT )); do
    kill -0 "$pid" 2>/dev/null || break
    if curl -fs -m 5 -H 'Accept: text/html' "$url" 2>/dev/null | grep -qi '<html'; then up=1; break; fi
    sleep 2; waited=$((waited + 2))
  done
  if [[ $up != 1 ]]; then
    echo "FAIL  $t: did not serve the page at $url within ${START_TIMEOUT}s — app log:"
    tail -80 "$logs/start.log" | sed 's/^/      /'
    kill "$pid" 2>/dev/null; return 1
  fi
  phase=probe;    log "$t: browser probe ($url)"
  (cd "$E2E_DIR" && node first-hour-probe.mjs --url "$url" $(crud_of "$t") --shot "$logs/failure.png") >"$logs/$phase.log" 2>&1
  local rc=$?
  sed 's/^/      /' "$logs/$phase.log"
  kill "$pid" 2>/dev/null; wait "$pid" 2>/dev/null
  [[ $rc == 0 ]] || { fail; return 1; }
  echo "PASS  $t (Mateu $VERSION)"
}

failed=() passed=()
i=0
for t in "${AVAILABLE[@]}"; do
  if run_target "$t" $((PORT + i)); then passed+=("$t"); else failed+=("$t"); fi
  i=$((i + 1))
done
echo
echo "First-hour smoke of Mateu $VERSION — passed: ${passed[*]:-none}; failed: ${failed[*]:-none}; not published: ${UNPUBLISHED[*]:-none}"
[[ ${#failed[@]} -eq 0 ]] || exit 1
[[ ${#UNPUBLISHED[@]} -eq 0 ]] || exit 3
}

main "$@"
