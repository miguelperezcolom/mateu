#!/usr/bin/env bash
# Boots each packaged Java starter on its own port and, through the Mateu action endpoint, checks
# the building blocks of every starter: the app shell at the root opens on the home page
# (homeRoute "home"), the home page answers with its "Browse products" call to action, and the
# products screen answers (the CRUD view model; for the YAML-only starter, the listing). The static
# starter has no server: its bundle is checked on disk.
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

# The app shell's serverSideType: the code starters' Shell class; the YAML shell has none.
shell_of() {
  case $1 in
    yaml) echo '' ;;
    *) echo 'com.example.app.Shell' ;;
  esac
}

# What the products screen answers with: the CRUD view model, or the YAML listing.
products_of() {
  case $1 in
    yaml) echo '"type":"Listing"|rowsSource' ;;
    *) echo 'com.example.app.Products' ;;
  esac
}

# Loads <route> inside the app shell of starter <s> on port <p> (as the shell's content area does).
load() {
  curl -s -m 10 -X POST -H 'Content-Type: application/json' \
    "http://localhost:$2/mateu/v3/components/_/action" \
    -d "{\"serverSideType\":\"$(shell_of "$1")\",\"route\":\"$3\",\"consumedRoute\":\"\",\"actionId\":\"\",\"componentState\":{}}" \
    2>/dev/null || true
}

check_static() {
  local b=static/target/mateu-bundle
  if [[ -f $b/index.html && -f $b/manifest.json ]] \
    && grep -q '"products"' $b/manifest.json && grep -q 'Espresso machine' $b/manifest.json \
    && grep -q '"home"' $b/manifest.json && grep -q 'Browse products' $b/manifest.json \
    && grep -q '"mockSources" *: *true' $b/manifest.json; then
    echo "✔ static: bundle written (index.html, manifest.json with the home page, the listing and its sample data)"
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
      if [[ "$body" == *'"homeRoute":"home"'* ]]; then ok=1; break; fi
      sleep 2
    done
    if [[ $ok == 1 ]]; then
      [[ "$(load "$one" "$p" /home)" == *'Browse products'* ]] || { echo "✘ $one: no home page"; ok=0; }
      [[ "$(load "$one" "$p" /products)" =~ $(products_of "$one") ]] || { echo "✘ $one: no products screen"; ok=0; }
    fi
    page=$(curl -s -m 5 "http://localhost:$p/" || true)
    kill "$pid" 2>/dev/null; wait "$pid" 2>/dev/null
    if [[ $ok == 1 && "$page" == *"<html"* ]]; then
      echo "✔ $one (port $p): page served; shell opens on home; home and products answered"
    else
      echo "✘ $one (port $p) did not answer; log:"; tail -40 "$log"; failed=1
    fi
    rm -f "$log"
  done
done
exit $failed
