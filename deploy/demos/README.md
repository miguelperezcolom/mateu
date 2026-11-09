# Public demos (`swapi.mateu.io`, `demo.mateu.io`)

Two apps in namespace `mateu-demos` of the owner's Cloudfleet cluster (Hetzner, one small node), behind
ingress-nginx and a Hetzner load balancer, TLS by cert-manager (`letsencrypt` ClusterIssuer, HTTP-01).
DNS is on Netlify (zone `mateu.io`): `swapi.mateu.io`, `demo.mateu.io`, `*.ec1.mateu.io` point at the LB.

| app | image | hosts |
|---|---|---|
| swapi-service (github.com/miguelperezcolom/swapi-service) | `miguelperezcolom/swapi-service:<date>` | `swapi.mateu.io` (root → Swagger UI), `swapi.ec1.mateu.io` |
| `demo/demo-vaadin-webflux` | `miguelperezcolom/demo-vaadin-webflux:<date>` | `demo.mateu.io`, `demo.ec1.mateu.io` |

Needs (owner's machine only): kube context for the cluster, Docker Hub push rights, the Netlify token.
The Star Wars demos (`starwars[-rw].ec1.mateu.io`) were retired: the museum and NASA demos cover what
they showed. `demo/demo-starwars` stays — the docs and tests use it, and swapi stays up for them.
Never touch the other namespaces of that cluster.

## Build & push (JDK 21 — swapi's Lombok doesn't compile on JDK 26)
```bash
TAG=$(date +%Y.%m.%d)
# demo: copy demo/demo-vaadin-webflux, set <mateu.version> to a release on Maven Central, then
mvn -B -ntp clean package -DskipTests
docker buildx build --platform linux/amd64 -f deploy/demos/demo-vaadin-webflux.Dockerfile \
  -t miguelperezcolom/demo-vaadin-webflux:$TAG -t miguelperezcolom/demo-vaadin-webflux:latest --push .
# bump the tag in k8s/20-demo-vaadin-webflux.yaml (same for swapi in k8s/10-swapi.yaml)

```

## The space and museum demos
`demo/demo-space` and `demo/demo-museum` each ship a Vaadin image and a static Redwood one, tagged with
the Mateu release in `<mateu.version>`, which must already be on Maven Central. Their APIs are separate
repos (`space-service`, `museum-service`), tagged with the short commit; deploy those first when the
demo's sources need something new from them. `clean` wipes `target/`, so push each image right after
its build:
```bash
(cd demo/demo-space && mvn -B -ntp clean package -DskipTests)
docker buildx build --platform linux/amd64 -f deploy/demos/demo-space.Dockerfile -t miguelperezcolom/demo-space:$V --push .
(cd demo/demo-space && mvn -B -ntp clean package -DskipTests -Predwood-bundle -Dmateu.bundle.environment=public)
docker buildx build --platform linux/amd64 -f deploy/demos/demo-space-redwood.Dockerfile -t miguelperezcolom/demo-space-redwood:$V --push .
```
Same for the museum. The container in these deployments is called `app`
(`kubectl set image deploy/space-service app=…`; with a wrong name it fails, and `rollout status` still
says «successfully rolled out» about the old image). Their databases live in memory: restarting a
service re-seeds it, which also clears what a test wrote.

## Memory

The cluster's nodes are small (~2.7 GiB allocatable each), so every JVM here runs with explicit flags
instead of the images' `-XX:MaxRAMPercentage=75` (which let a JVM grow towards 75 % of its limit and
never give memory back). Measured on Spring Boot + Mateu (Java 21, Alpine): heap in use is ~40 MB,
metaspace ~100–115 MB, and the C2 JIT's code cache + arenas cost ~60 MB more than C1 alone.

```
-XX:+UseSerialGC -Xms32m -Xmx160m -XX:MinHeapFreeRatio=10 -XX:MaxHeapFreeRatio=30
-XX:TieredStopAtLevel=1 -XX:ReservedCodeCacheSize=48m -XX:MaxMetaspaceSize=<192|224>m -Xss512k
-XX:+ExitOnOutOfMemoryError
```

- Serial GC (what the JVM picks anyway on 2 CPUs), heap capped at 160 MB and shrunk after GC
  (`MaxHeapFreeRatio`); single-user demos do not need more.
- C1 only (`TieredStopAtLevel=1`): lower peak throughput, irrelevant here, and a smaller code cache.
- `MaxMetaspaceSize` is a guard, not a saving: 192m for the REST services, 224m for the Mateu UIs
  (the Explorer, the biggest, uses 256m and `-Xmx192m`); `ExitOnOutOfMemoryError` lets Kubernetes
  restart a JVM that hit it instead of leaving it half alive.
- Requests follow measured use (+ margin): REST services 288Mi, UI apps 224Mi, Explorer remotes
  176Mi; limits keep head-room for a heap that fills (416–448Mi, Explorer 512Mi).

Result (2026-11-09): the JVM pods went from 183–333 MiB to ~140–250 MiB each. Re-check after an
image upgrade with `kubectl top pods`, and the services' `/actuator/prometheus` (`jvm_memory_*`).

## Deploy
```bash
K="kubectl --context <cluster-context>"
$K apply -f deploy/demos/k8s/00-namespace.yaml
$K -n mateu-demos get secret swapi-write-key >/dev/null 2>&1 || \
  $K -n mateu-demos create secret generic swapi-write-key \
     --from-literal=WRITE_KEY="$(head -c 32 /dev/urandom | base64 | tr -d '/+=' | head -c 32)"
$K apply -f deploy/demos/k8s/
$K -n mateu-demos rollout status deploy/swapi deploy/demo-vaadin-webflux --timeout=5m
```
Check certificates: `$K -n mateu-demos get certificate,challenge`.
