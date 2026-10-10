#!/usr/bin/env bash
# Boots each packaged Java starter on its own port, loads the root route through the Mateu action
# endpoint and checks the CRUD view model answered. Run after `mvn -f starters/pom.xml package`.
#
#   starters/smoke-test.sh                 # all of them
#   starters/smoke-test.sh spring-mvc      # just one
set -uo pipefail
cd "$(dirname "$0")"

JAVA=${JAVA:-java}
port_of() {
  case $1 in
    spring-mvc) echo 18181 ;; spring-webflux) echo 18182 ;; quarkus) echo 18183 ;;
    micronaut) echo 18184 ;; helidon-mp) echo 18185 ;;
  esac
}

cmd_for() {
  local s=$1 p; p=$(port_of "$1")
  case $s in
    spring-mvc|spring-webflux) echo "$JAVA -jar $s/target/mateu-starter-$s-1.0.0-SNAPSHOT.jar --server.port=$p" ;;
    quarkus)   echo "$JAVA -Dquarkus.http.port=$p -jar quarkus/target/quarkus-app/quarkus-run.jar" ;;
    micronaut) echo "$JAVA -Dmicronaut.server.port=$p -jar micronaut/target/mateu-starter-micronaut-1.0.0-SNAPSHOT.jar" ;;
    helidon-mp) echo "$JAVA -Dserver.port=$p -jar helidon-mp/target/mateu-starter-helidon-mp.jar" ;;
  esac
}

failed=0
for s in "${@:-spring-mvc spring-webflux quarkus micronaut helidon-mp}"; do
  for one in $s; do
    p=$(port_of "$one")
    log=$(mktemp)
    $(cmd_for "$one") >"$log" 2>&1 &
    pid=$!
    ok=0
    for _ in $(seq 1 60); do
      body=$(curl -s -m 5 -X POST -H 'Content-Type: application/json' \
        "http://localhost:$p/mateu/v3/components/_/action" \
        -d '{"route":"","actionId":"","componentState":{}}' 2>/dev/null || true)
      if [[ "$body" == *"com.example.app.Products"* ]]; then ok=1; break; fi
      sleep 2
    done
    page=$(curl -s -m 5 "http://localhost:$p/" || true)
    kill "$pid" 2>/dev/null; wait "$pid" 2>/dev/null
    if [[ $ok == 1 && "$page" == *"<html"* ]]; then
      echo "✔ $one (port $p): page served, CRUD view model answered"
    else
      echo "✘ $one (port $p) did not answer; log:"; tail -40 "$log"; failed=1
    fi
    rm -f "$log"
  done
done
exit $failed
