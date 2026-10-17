#!/usr/bin/env bash
# One leg of the e2e matrix of run_tests.yml: which SUT apps it builds and starts, and which
# Playwright projects it runs. The e2e suite used to run as ONE job on one Playwright worker (~20 of
# its ~25 minutes were the tests: the shared suite takes ~4 min per adapter, five times). Each leg
# now owns its SUT apps, so the legs run side by side while every test still has its SUT to itself —
# no spec had to become safe to run concurrently against one server.
#
#   core               mvc-app1 + journeys + renderer-vaadin + both federations + the YAML federation
#                      (and, in the workflow, the slow-network probe and the axe audit, on mvc-app1)
#   webflux-quarkus    the shared suite on webflux-app1 and quarkus-app1
#   micronaut-helidon  the shared suite on micronaut-app1 and helidon-app1
#
# Usage: scripts/ci-e2e-leg.sh <leg> build|start|wait|test|logs   (from anywhere; paths are repo-relative)
#   build  the leg's SUT modules (the backend must already be installed) — and the YAML federation
#   start  launch the leg's SUT apps in the background (logs in $LOG_DIR, default /tmp)
#   wait   block until each is answering (max 3 min per port, then fail)
#   test   the leg's Playwright projects (needs `npm ci` + browsers in e2e/)
#   logs   tail the leg's SUT logs (for the on-failure step)
#   stop   kill what `start` launched (local runs)
#
# Env: MVN_OPTS_EXTRA  extra Maven options, e.g. -Dmaven.repo.local=…
#      JAVA            the java binary (default: java)
#      LOG_DIR         where the SUT logs go (default: /tmp)
#      E2E_PORT_OFFSET local runs only: shift the five adapter apps' ports (8080→8080+offset, …)
#                      so they don't collide with whatever is on 8080–8086. CI leaves it at 0. The
#                      federation apps keep their ports: their specs and configs name them.
set -euo pipefail
cd "$(dirname "$0")/.."

leg=${1:?usage: $0 <core|webflux-quarkus|micronaut-helidon> <build|start|wait|test|logs|stop>}
stage=${2:?usage: $0 <leg> <build|start|wait|test|logs|stop>}
JAVA=${JAVA:-java}
LOG_DIR=${LOG_DIR:-/tmp}
OFFSET=${E2E_PORT_OFFSET:-0}
PIDS="$LOG_DIR/e2e-$leg.pids"

case "$leg" in
  core)              apps="mvc-app1 fed-remote-app fed-shell-app fed-sections-app"
                     projects="mvc-app1 journeys renderer-vaadin fed-shell-app fed-sections-app yaml-federation" ;;
  webflux-quarkus)   apps="webflux-app1 quarkus-app1";   projects="webflux-app1 quarkus-app1" ;;
  micronaut-helidon) apps="micronaut-app1 helidon-app1"; projects="micronaut-app1 helidon-app1" ;;
  *) echo "unknown leg: $leg" >&2; exit 2 ;;
esac

# app → jar, port, how its port is overridden, and the URL variable playwright.config.ts reads.
jar_of() {
  case "$1" in
    quarkus-app1) echo "e2e/sut/apps/quarkus-app1/target/quarkus-app1-1.0.0-SNAPSHOT-runner.jar" ;;
    helidon-app1) echo "e2e/sut/apps/helidon-app1/target/helidon-app1.jar" ;;
    *)            echo "e2e/sut/apps/$1/target/$1-1.0.0-SNAPSHOT.jar" ;;
  esac
}
port_of() {
  case "$1" in
    mvc-app1) echo $((8080 + OFFSET)) ;;       webflux-app1) echo $((8081 + OFFSET)) ;;
    quarkus-app1) echo $((8082 + OFFSET)) ;;   micronaut-app1) echo $((8083 + OFFSET)) ;;
    helidon-app1) echo $((8086 + OFFSET)) ;;
    fed-shell-app) echo 8084 ;; fed-remote-app) echo 8085 ;; fed-sections-app) echo 8087 ;;
  esac
}
port_args() {
  [ "$OFFSET" = 0 ] && return 0
  case "$1" in
    quarkus-app1)   echo "-Dquarkus.http.port=$(port_of "$1")" ;;
    micronaut-app1) echo "-Dmicronaut.server.port=$(port_of "$1")" ;;
    helidon-app1)   echo "-Dserver.port=$(port_of "$1")" ;;
    mvc-app1|webflux-app1) echo "-Dserver.port=$(port_of "$1")" ;;
  esac
}
url_var_of() {
  case "$1" in
    mvc-app1) echo MVC_APP1_URL ;; webflux-app1) echo WEBFLUX_APP1_URL ;; quarkus-app1) echo QUARKUS_APP1_URL ;;
    micronaut-app1) echo MICRONAUT_APP1_URL ;; helidon-app1) echo HELIDON_APP1_URL ;;
  esac
}
# The federation apps answer 404 on / — any HTTP response means they are up; the rest must be 2xx.
ready_mode_of() { case "$1" in fed-*) echo any ;; *) echo ok ;; esac; }

wait_port() {
  local port=$1 mode=$2 tries=0
  echo "Waiting for port $port ($mode)..."
  while true; do
    if [ "$mode" = ok ]; then
      curl -sf "http://localhost:$port/" > /dev/null && break
    else
      curl -s -o /dev/null "http://localhost:$port/" && break
    fi
    tries=$((tries + 1))
    if [ "$tries" -ge 90 ]; then
      echo "::error::port $port was not ready after 3 minutes"
      exit 1
    fi
    sleep 2
  done
  echo "Port $port is ready"
}

case "$stage" in
  build)
    modules=$(for a in $apps; do printf 'apps/%s,' "$a"; done)
    # shellcheck disable=SC2086
    mvn -B install -Dmaven.test.skip=true -Dgpg.skip=true ${MVN_OPTS_EXTRA:-} --file e2e/sut/pom.xml -pl "${modules%,}" -am
    if [ "$leg" = core ]; then
      # the YAML-only federation: a console, a served domain and a static bundle (its README.md)
      # shellcheck disable=SC2086
      mvn -B package -Dmaven.test.skip=true -Dgpg.skip=true ${MVN_OPTS_EXTRA:-} --file e2e/sut/yaml-federation/pom.xml
    fi
    ;;
  start)
    : > "$PIDS"
    for a in $apps; do
      # shellcheck disable=SC2046
      "$JAVA" $(port_args "$a") -jar "$(jar_of "$a")" > "$LOG_DIR/$a.log" 2>&1 &
      echo $! >> "$PIDS"
    done
    if [ "$leg" = core ]; then
      # its own script: two Spring Boot apps plus the static file host (node), waited for on start
      if command -v timeout > /dev/null; then timeout 300 e2e/sut/yaml-federation/run.sh --no-build
      else e2e/sut/yaml-federation/run.sh --no-build; fi
    fi
    ;;
  wait)
    for a in $apps; do wait_port "$(port_of "$a")" "$(ready_mode_of "$a")"; done
    ;;
  test)
    args=()
    for p in $projects; do args+=(--project "$p"); done
    for a in $apps; do
      v=$(url_var_of "$a")
      if [ -n "$v" ]; then export "$v=${!v:-http://localhost:$(port_of "$a")}"; fi
    done
    # YAML_FEDERATION lists the yaml-federation project under CI (playwright.config.ts)
    if [ "$leg" = core ]; then export YAML_FEDERATION=1; fi
    cd e2e && npx --no -- playwright test "${args[@]}"
    ;;
  logs)
    for a in $apps; do
      f="$LOG_DIR/$a.log"
      [ -f "$f" ] || continue
      echo "===== $f ====="
      tail -n 60 "$f"
    done
    if [ "$leg" = core ]; then
      for f in e2e/sut/yaml-federation/*.log; do
        [ -f "$f" ] || continue
        echo "===== $f ====="
        tail -n 60 "$f"
      done
    fi
    ;;
  stop)
    if [ -f "$PIDS" ]; then
      while read -r pid; do kill "$pid" 2>/dev/null || true; done < "$PIDS"
      rm -f "$PIDS"
    fi
    if [ "$leg" = core ]; then e2e/sut/yaml-federation/run.sh stop || true; fi
    ;;
  *) echo "unknown stage: $stage" >&2; exit 2 ;;
esac
