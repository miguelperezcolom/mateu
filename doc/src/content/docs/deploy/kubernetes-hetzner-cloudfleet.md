---
title: "Kubernetes on Hetzner with Cloudfleet"
description: "Run a Mateu backend as a container on a Cloudfleet-managed Kubernetes cluster with Hetzner nodes: image, Deployment, ingress, TLS certificates, DNS, and scaling to zero."
---

This guide runs a Mateu app — any backend that serves the Mateu HTTP endpoints — on a
[Cloudfleet](https://cloudfleet.ai) Kubernetes cluster whose nodes are Hetzner Cloud servers. It is
written from the way the project's own public demos are run, with the names replaced by
placeholders.

The examples use a Spring Boot app. The same manifests work for a **.NET** or **Python** backend:
only the image, the port and the probe path change — Kubernetes sees a container that answers HTTP.

:::tip[You may not need a cluster]
A UI exported as a [static bundle](/deploy/static-bundle/) has no server at runtime: put the folder
on a static host such as [Netlify](/deploy/netlify/) and skip everything below.
:::

Before going live, also go through the [production checklist](/deploy/production-checklist/)
(paths, auth, CSP, CORS).

## Prerequisites

- A Cloudfleet cluster with a **Hetzner fleet** (Cloudfleet provisions the Hetzner servers on demand,
  within the fleet's CPU limit).
- `kubectl` with a context for that cluster. The commands below write `kubectl` for short; in
  practice always pass `--context <your-cluster-context>` so you never apply to the wrong cluster.
- **ingress-nginx** installed with Helm. Its controller Service is of type `LoadBalancer`, so
  Cloudfleet's cloud controller creates a **Hetzner Load Balancer** in front of it — that is the
  public entry point of every app in the cluster.

  ```bash
  helm upgrade --install ingress-nginx ingress-nginx \
    --repo https://kubernetes.github.io/ingress-nginx \
    --namespace ingress-nginx --create-namespace
  ```
- **cert-manager** installed (for Let's Encrypt certificates):

  ```bash
  helm upgrade --install cert-manager cert-manager \
    --repo https://charts.jetstack.io \
    --namespace cert-manager --create-namespace --set crds.enabled=true
  ```
- A container registry you can push to (Docker Hub, GHCR, …) and a DNS zone you control.

## 1. Build the image

A small runtime image, running as a non-root user:

```dockerfile
FROM eclipse-temurin:21-jre-alpine
RUN addgroup -S app && adduser -S -G app -u 10001 app
WORKDIR /opt/app
COPY --chown=app:app target/my-mateu-app.jar app.jar
ENV SERVER_PORT=8080 JAVA_TOOL_OPTIONS="-Djava.io.tmpdir=/tmp -XX:MaxRAMPercentage=75"
USER app
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

Build the jar, then the image for **linux/amd64** and push it with a date tag (plus `latest`):

```bash
mvn -B -ntp clean package -DskipTests
TAG=$(date +%Y.%m.%d)
docker buildx build --platform linux/amd64 \
  -t registry.example.com/acme/my-mateu-app:$TAG \
  -t registry.example.com/acme/my-mateu-app:latest \
  --push .
```

Why `--platform linux/amd64`: the Hetzner nodes are x86. On an Apple Silicon Mac a plain
`docker build` produces an **arm64** image, which the node cannot run (the pod fails with
`exec format error`). `buildx` cross-builds the right architecture; the `nodeSelector` below makes
the mismatch impossible in the other direction too.

Pin the Deployment to the dated tag, not `latest`: a rollout then means "this exact image", and
rolling back is changing one line.

## 2. Namespace

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: my-apps
```

## 3. Deployment and Service

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-mateu-app
  namespace: my-apps
  labels: { app: my-mateu-app }
spec:
  replicas: 1
  selector:
    matchLabels: { app: my-mateu-app }
  template:
    metadata:
      labels: { app: my-mateu-app }
    spec:
      nodeSelector:
        kubernetes.io/arch: amd64
      securityContext:
        runAsNonRoot: true
        runAsUser: 10001
        seccompProfile: { type: RuntimeDefault }
      containers:
        - name: app
          image: registry.example.com/acme/my-mateu-app:2026.10.12
          env:
            - { name: SERVER_PORT, value: "8080" }
            - { name: JAVA_TOOL_OPTIONS, value: "-Djava.io.tmpdir=/tmp -XX:MaxRAMPercentage=75" }
            # Only if the UI is embedded from OTHER origins (e.g. <mateu-ui baseUrl="https://…">
            # on a third-party page). CORS is off by default.
            # - { name: MATEU_CORS_ALLOWED_ORIGINS, value: "https://portal.example.com" }
          ports:
            - { name: http, containerPort: 8080 }
          securityContext:
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
            capabilities: { drop: ["ALL"] }
          resources:
            requests: { memory: "384Mi", cpu: "100m" }
            limits:   { memory: "512Mi" }
          volumeMounts:
            - { name: tmp, mountPath: /tmp }
          startupProbe:
            httpGet: { path: /actuator/health/liveness, port: 8080 }
            periodSeconds: 5
            failureThreshold: 60
          readinessProbe:
            httpGet: { path: /actuator/health/readiness, port: 8080 }
            periodSeconds: 10
          livenessProbe:
            httpGet: { path: /actuator/health/liveness, port: 8080 }
            periodSeconds: 20
      volumes:
        - { name: tmp, emptyDir: {} }
---
apiVersion: v1
kind: Service
metadata:
  name: my-mateu-app
  namespace: my-apps
spec:
  selector: { app: my-mateu-app }
  ports:
    - { name: http, port: 8080, targetPort: 8080 }
```

What each part is for:

- **Memory.** `-XX:MaxRAMPercentage=75` sizes the heap from the container's **limit**, leaving a
  quarter for metaspace, threads and native buffers. Set the request close to the limit (the
  example uses 384Mi / 512Mi) so the scheduler reserves what the JVM will actually use; a small
  Spring Boot + Mateu app is comfortable at 512Mi, raise both together if you see `OOMKilled`.
- **Read-only root filesystem.** The container can write nowhere except the `/tmp` `emptyDir`, and
  `java.io.tmpdir` points there. Mateu keeps no UI state on disk or in the session, so nothing else
  is needed.
- **Probes.** Use any cheap URL that answers 200 once the app is up: Spring Boot Actuator's
  `/actuator/health/{liveness,readiness}` if you have it, otherwise one of your own Mateu routes
  (e.g. `/` or `/orders`). The startup probe gives a slow first boot up to 5 minutes
  (`60 × 5s`) before liveness starts counting.
- **Replicas.** Mateu view models are stateless — instantiated per request — so you can run several
  replicas behind the Service with no sticky sessions. The exception is the **app's own data**: if
  it lives in memory (an H2 demo database, a static list), two replicas are two databases. For such
  an app keep `replicas: 1` and add `strategy: { type: Recreate }` so an update never runs two
  copies side by side.

### Secrets

Create secrets **once**, from the command line, and reference them from the Deployment. Never put
the value in a YAML file in the repository:

```bash
kubectl -n my-apps get secret my-app-secrets >/dev/null 2>&1 || \
  kubectl -n my-apps create secret generic my-app-secrets \
    --from-literal=API_KEY="$(head -c 32 /dev/urandom | base64 | tr -d '/+=' | head -c 32)"
```

The `get … ||` guard makes the command safe to rerun: it does not rotate an existing key.

```yaml
          env:
            - name: API_KEY
              valueFrom:
                secretKeyRef: { name: my-app-secrets, key: API_KEY }
```

For a REST source that injects `${secret.X}` on the proxy leg, the variable is
`MATEU_SECRET_X` (see the [production checklist](/deploy/production-checklist/)).

## 4. TLS: a ClusterIssuer

One issuer for the whole cluster, Let's Encrypt production, HTTP-01 challenges answered through
ingress-nginx:

```yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: ops@example.com
    privateKeySecretRef:
      name: letsencrypt-account-key
    solvers:
      - http01:
          ingress:
            ingressClassName: nginx
```

## 5. Ingress

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-mateu-app
  namespace: my-apps
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt
spec:
  ingressClassName: nginx
  tls:
    - hosts: [app.example.com]
      secretName: my-mateu-app-tls
  rules:
    - host: app.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service: { name: my-mateu-app, port: { number: 8080 } }
```

Serve the app at the **root** of its host: a servlet context path is not supported (the page loads
`/assets` from the host root).

**One Ingress per host.** A single Ingress listing several hosts gets a single certificate covering
all of them, and that certificate cannot be issued until **every** host resolves to the cluster. With
one Ingress (and one certificate) per host, a new name works as soon as its own DNS is right, even
while another name still points at an old server — useful during a migration.

Apply everything (the Ingress needs ingress-nginx running, because its validating webhook checks
it):

```bash
kubectl apply -f 00-namespace.yaml -f 05-cluster-issuer.yaml
kubectl apply -f 10-my-mateu-app.yaml
kubectl apply -f 30-ingress.yaml
kubectl -n my-apps rollout status deploy/my-mateu-app --timeout=5m
```

To redeploy the same tag (after pushing a new `latest`, say):
`kubectl -n my-apps rollout restart deploy/my-mateu-app`.

## 6. DNS

Read the public addresses of the Hetzner Load Balancer from the ingress controller's Service:

```bash
kubectl -n ingress-nginx get svc ingress-nginx-controller
# EXTERNAL-IP shows the IPv4 (and IPv6, when enabled) of the load balancer
```

Create, in your DNS zone, an **A** record (and an **AAAA** record for the IPv6) for each host,
pointing at those addresses. Every app in the cluster shares the same load balancer, so further
hosts are just more records with the same values.

## 7. Certificates: checking and unsticking

```bash
kubectl -n my-apps get certificate,challenge
```

- While a host's DNS does not point at the load balancer, the Challenge stays **pending**.
  cert-manager runs its own self-check first and does not present anything to Let's Encrypt until
  it passes, so a waiting certificate burns **no rate limit**. It completes by itself once DNS is
  right — no need to reapply.
- If a certificate is still stuck after DNS was fixed, force a fresh attempt:

  ```bash
  kubectl -n my-apps delete certificaterequest --all
  ```

## 8. Fleet limits

Cloudfleet adds Hetzner servers when pods do not fit, up to the fleet's CPU limit. Set it to what
you are willing to pay for:

```bash
cloudfleet clusters fleets update <cluster-id> <fleet-name> 'limits.cpu: 2, hetzner.enabled: true'
```

`hetzner.enabled: true` must be in every update — the API rejects one without it. The stored Hetzner
API token is kept.

## 9. Scale to zero (hibernate)

For demos or environments that are not always needed, you can bring the cost down to almost nothing:

```bash
kubectl -n my-apps scale deploy --all --replicas=0
kubectl -n ingress-nginx scale deploy ingress-nginx-controller --replicas=0
kubectl -n cert-manager scale deploy cert-manager cert-manager-cainjector cert-manager-webhook --replicas=0
# no more nodes: Cloudfleet removes the now-empty server
cloudfleet clusters fleets update <cluster-id> <fleet-name> 'limits.cpu: 0, hetzner.enabled: true'
```

:::caution[The load balancer keeps billing]
Scaling to zero removes the **server**, not the **Hetzner Load Balancer**: it exists (and is billed)
as long as the ingress controller's Service is of type `LoadBalancer`. To drop it as well:

```bash
kubectl -n ingress-nginx patch svc ingress-nginx-controller -p '{"spec":{"type":"ClusterIP"}}'
```

The load balancer's IP addresses are then **released**. On resume a new load balancer gets new
addresses, and every DNS record must be re-pointed (step 6) — with certificates waiting until it is.
:::

**Resume:** set the fleet limit back (`'limits.cpu: 2, hetzner.enabled: true'`), scale the three
groups above back to 1 replica, and — if you dropped the load balancer — patch the Service back to
`{"spec":{"type":"LoadBalancer"}}` (a `helm upgrade` of ingress-nginx also restores it) and update
DNS.

## 10. Delete

```bash
kubectl delete namespace my-apps
```

This removes the app, its Service, Ingress, certificates and secrets. Images stay in the registry;
delete them there if you want to.
