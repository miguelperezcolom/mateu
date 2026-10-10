#!/usr/bin/env bash
# Boots each packaged Java starter on its own port, loads the root route through the Mateu action
# endpoint and checks the CRUD view model answered (the YAML-only starter: its app shell and the
# sample rows of its listing). The static starter has no server: its bundle is checked on disk.
# Run after `mvn -f starters/pom.xml package`.
#
#   starters/smoke-test.sh                 # all of them
#   starters/smoke-test.sh spring-mvc      # just one
set -uo pipefail
cd "$(dirname "$0")"

JAVA=${JAVA:-java}
port_of() {
  case $1 in
    spring-mvc) echo 18181 ;; spring-webflux) echo 18182 ;; quarkus) echo 18183 ;;
    micronaut) echo 18184 ;; helidon-mp) echo 18185 ;; yaml) echo 18186 ;;
  esac
}

cmd_for() {
  local s=$1 p; p=$(port_of "$1")
  case $s in
    spring-mvc|spring-webflux) echo "$JAVA -jar $s/target/mateu-starter-$s-1.0.0-SNAPSHOT.jar --server.port=$p" ;;
    quarkus)   echo "$JAVA -Dquarkus.http.port=$p -jar quarkus/target/quarkus-app/quarkus-run.jar" ;;
    micronaut) echo "$JAVA -Dmicronaut.server.port=$p -jar micronaut/target/mateu-starter-micronaut-1.0.0-SNAPSHOT.jar" ;;
    helidon-mp) echo "$JAVA -Dserver.port=$p -jar helidon-mp/target/mateu-starter-helidon-mp.jar" ;;
    yaml) echo "$JAVA -jar yaml/target/mateu-starter-yaml-1.0.0-SNAPSHOT.jar --server.port=$p" ;;
  esac
}

# What a healthy answer contains: the CRUD view model, or for the YAML starter the app shell (root)
# and the listing's sample rows (route products, loaded by the shell).
expect_of() {
  case $1 in
    yaml) echo '"type":"AppShell"|"title":"My app"' ;;
    *) echo 'com.example.app.Products' ;;
  esac
}

check_static() {
  local b=static/target/mateu-bundle
  if [[ -f $b/index.html && -f $b/manifest.json ]] \
    && grep -q '"products"' $b/manifest.json && grep -q 'Espresso machine' $b/manifest.json \
    && grep -q '"mockSources" *: *true' $b/manifest.json; then
    echo "✔ static: bundle written (index.html, manifest.json with the listing and its sample data)"
  else
    echo "✘ static: no complete bundle in $b"; ls -la $b 2>/dev/null; return 1
  fi
}

failed=0
for s in "${@:-spring-mvc spring-webflux quarkus micronaut helidon-mp yaml static}"; do
  for one in $s; do
    if [[ $one == static ]]; then check_static || failed=1; continue; fi
    p=$(port_of "$one")
    log=$(mktemp)
    $(cmd_for "$one") >"$log" 2>&1 &
    pid=$!
    ok=0
    for _ in $(seq 1 60); do
      body=$(curl -s -m 5 -X POST -H 'Content-Type: application/json' \
        "http://localhost:$p/mateu/v3/components/_/action" \
        -d '{"route":"","actionId":"","componentState":{}}' 2>/dev/null || true)
      if [[ "$body" =~ $(expect_of "$one") ]]; then ok=1; break; fi
      sleep 2
    done
    if [[ $ok == 1 && $one == yaml ]]; then
      rows=$(curl -s -m 10 -X POST -H 'Content-Type: application/json' \
        "http://localhost:$p/mateu/v3/components/_/action" \
        -d '{"route":"/products","consumedRoute":"","actionId":"","componentState":{}}' 2>/dev/null || true)
      [[ "$rows" == *'"type":"Listing"'* || "$rows" == *'rowsSource'* ]] || ok=0
    fi
    page=$(curl -s -m 5 "http://localhost:$p/" || true)
    kill "$pid" 2>/dev/null; wait "$pid" 2>/dev/null
    if [[ $ok == 1 && "$page" == *"<html"* ]]; then
      echo "✔ $one (port $p): page served, UI answered"
    else
      echo "✘ $one (port $p) did not answer; log:"; tail -40 "$log"; failed=1
    fi
    rm -f "$log"
  done
done
exit $failed
