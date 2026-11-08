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

## The Mateu Explorer (`explorer.mateu.io`)
`demo/demo-explorer` + the five remotes of its *Distributed UIs* area, all in `k8s/70-demo-explorer.yaml`.
Live as a **preview on 3.0-beta.51** since 2026-11-08 (tag `3.0-beta.51-explorer-20261108`); redeploy at rc.1.

| deployment | image | host | requests / limits |
|---|---|---|---|
| `demo-explorer` (Spring Boot MVC, Vaadin) | `miguelperezcolom/demo-explorer` | `explorer.mateu.io` (own A + AAAA → the LB) | 320Mi / 512Mi |
| `demo-explorer-java-remote` | `miguelperezcolom/demo-explorer-java-remote` | `explorer-java.ec1.mateu.io` | 256Mi / 448Mi |
| `demo-explorer-yaml-remote` | `miguelperezcolom/demo-explorer-yaml-remote` | `explorer-yaml.ec1.mateu.io` | 256Mi / 448Mi |
| `demo-explorer-static-remote` (nginx) | `miguelperezcolom/demo-explorer-static-remote` | `explorer-static.ec1.mateu.io` | 16Mi / 64Mi |
| `demo-explorer-python-remote` (FastAPI) | `miguelperezcolom/demo-explorer-python-remote` | `explorer-python.ec1.mateu.io` | 64Mi / 192Mi |

The remotes ride the `*.ec1.mateu.io` wildcard (no DNS change). Where they are is ENV, not code: the
Explorer reads `EXPLORER_{JAVA,YAML,STATIC,PYTHON}_REMOTE_URL` (`examples/distributed/Remotes.java`),
the remotes allow `EXPLORER_ORIGIN=https://explorer.mateu.io` (their `mateu.cors.allowed-origins` /
`cors_origins`); the static one answers `Access-Control-Allow-Origin: *`. Measured after the first
deploy: Explorer ~300Mi, each JVM remote ~170Mi, Python ~80Mi, nginx ~2Mi — the nodes' memory REQUESTS
sit at 81–95%, so give the next app room before adding one (never raise the fleet limits for it).

Build (JDK 21) and push — the repo has no `.dockerignore`, so build from a context that holds only the
artifacts, at the same paths the Dockerfiles copy:
```bash
V=3.0-beta.51-explorer-$(date +%Y%m%d)
(cd demo/demo-explorer && mvn -B -ntp clean package -DskipTests -Dmateu.version=3.0-beta.51)
(cd demo/demo-explorer/remotes && mvn -B -ntp clean package -DskipTests -Dmateu.version=3.0-beta.51)
C=$(mktemp -d); E=demo/demo-explorer; R=$E/remotes
mkdir -p $C/$E/target $C/$R/{java-remote,yaml-remote,static-remote}/target $C/$R/python-remote
cp $E/target/demo-explorer-1.0-SNAPSHOT.jar $C/$E/target/
cp $R/java-remote/target/explorer-java-remote-1.0-SNAPSHOT.jar $C/$R/java-remote/target/
cp $R/yaml-remote/target/explorer-yaml-remote-1.0-SNAPSHOT.jar $C/$R/yaml-remote/target/
cp -R $R/static-remote/target/mateu-bundle $C/$R/static-remote/target/
cp $R/python-remote/{requirements.txt,main.py} $C/$R/python-remote/
docker buildx build --platform linux/amd64 -f deploy/demos/demo-explorer.Dockerfile -t miguelperezcolom/demo-explorer:$V --push $C
for t in java-remote yaml-remote static-remote python-remote; do
  docker buildx build --platform linux/amd64 -f deploy/demos/demo-explorer-remotes.Dockerfile --target $t \
    -t miguelperezcolom/demo-explorer-$t:$V --push $C
done
```
Deploy (bump the five `image:` tags in `k8s/70-demo-explorer.yaml` first; every container is `app`):
```bash
$K apply -f deploy/demos/k8s/70-demo-explorer.yaml
$K -n mateu-demos rollout status deploy/demo-explorer deploy/demo-explorer-java-remote \
  deploy/demo-explorer-yaml-remote deploy/demo-explorer-static-remote deploy/demo-explorer-python-remote --timeout=6m
$K -n mateu-demos get certificate | grep explorer
```
Verify from the outside (Playwright from the repo's `e2e/`):
```bash
cd demo/demo-explorer && mvn -q test -Dmateu.version=3.0-beta.51     # writes target/explorer-entries.json
EXPLORER_URL=https://explorer.mateu.io node e2e/explorer-probe.mjs   # 2026-11-08: 203/206, the 3 known issues
cd remotes && EXPLORER_URL=https://explorer.mateu.io EXPLORER_JAVA_REMOTE_URL=https://explorer-java.ec1.mateu.io \
  EXPLORER_STATIC_REMOTE_URL=https://explorer-static.ec1.mateu.io SKIP_REMOTE_RESTART=true node probe.mjs  # 22/22
```
(`SKIP_REMOTE_RESTART` skips the version-skew check, which restarts a LOCAL Java remote.)
