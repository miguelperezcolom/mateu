---
title: "Netlify"
description: "Deploy a Mateu static bundle to Netlify — by hand with netlify-cli, or from GitHub Actions with two repository secrets, the way mateu.io itself is published."
---

A Mateu UI exported as a [static bundle](/deploy/static-bundle/) is a folder of plain files, so any
static host serves it. This guide uses Netlify. It covers a one-off deploy from your machine and a
CI deploy from GitHub Actions — the same setup that publishes this documentation site.

A UI that needs a server (view models with logic, proxied sources with secrets) does not fit here;
see [Kubernetes](/deploy/kubernetes-hetzner-cloudfleet/) or your platform of choice. A **hybrid**
bundle — static screens, the rest falling through to a backend at `baseUrl` — works on Netlify too,
as long as that backend allows the site's origin (CORS).

## 1. Build the bundle

A project generated as **YAML only, static** (`-Dauthoring=static`) has the bundle goal bound
already:

```bash
mvn package
# → target/mateu-bundle/
#     index.html      boots the renderer
#     manifest.json   the screens, routes and REST source catalogue
#     assets/         the renderer
#     _redirects      /* → /index.html (SPA fallback)
```

For a code project, add the `mateu-bundle-maven-plugin` as shown in
[Static bundle › Exporting](/deploy/static-bundle/#exporting). Set `-Dmateu.bundle.static=true` to
fail the build if any screen still needs a server.

Preview it locally before deploying:

```bash
npx serve -s target/mateu-bundle
```

While you are still editing the screens, `mvn mateu-bundle:dev` serves the bundle and rebuilds it on
every save (see [Develop with live reload](/deploy/static-ui/#develop-with-live-reload)).

### What Netlify needs from the folder

- **SPA fallback.** The bundle ships a `_redirects` file with `/* /index.html 200`, which Netlify
  reads as is, so deep links like `/orders/42` boot the app. Nothing to configure.
- **Caching.** Netlify's default (`max-age=0, must-revalidate` with an ETag) is what the renderer's
  assets want: their names are stable across releases, so the browser keeps them and revalidates
  with a cheap 304. Don't mark `/assets/*` as `immutable` — a new release would not reach users
  with a cached copy.
- **CORS on your APIs.** The browser calls the APIs named in `sources.yaml` directly, so each must
  allow the site's origin (`https://<site>.netlify.app` and your custom domain). Alternatively proxy
  them through Netlify with a rewrite (`/api/*  https://api.example.com/:splat  200`) and use
  relative URLs in the sources: same origin, no CORS. The rule must come **before** the bundle's
  `/*` fallback, and the bundle rewrites `_redirects` on every build, so prepend it in a step after
  `mvn package` (or put it in a `netlify.toml` `[[redirects]]` block).
- **No secrets.** Anything in the bundle is readable by every visitor. An API that needs a key must
  be called through a server (a source in `proxy` mode on a Mateu backend), never with a key in
  `sources.yaml`.

## 2. Deploy by hand

```bash
npx netlify-cli login                       # opens the browser once
npx netlify-cli deploy --dir=target/mateu-bundle            # a draft URL to check
npx netlify-cli deploy --dir=target/mateu-bundle --prod     # publish
```

The first `deploy` asks whether to link the folder to an existing site or create one; it writes
the choice to `.netlify/state.json` (keep that out of version control).

## 3. Deploy from CI

Let CI build and publish on every push to your main branch, so the published site is always a
function of the repository and never of someone's laptop. Netlify's own Git integration works too,
but its build image is not set up for a Maven build; building in your CI and uploading the folder
keeps the toolchain where it already is.

### Secrets

Create two repository secrets (GitHub › Settings › Secrets and variables › Actions):

| Secret | Where to find it |
|---|---|
| `NETLIFY_AUTH_TOKEN` | Netlify › User settings › Applications › **Personal access tokens** |
| `NETLIFY_SITE_ID` | Netlify › your site › Site configuration › General › Site details › **Site ID** |

The token can deploy every site of that Netlify account; treat it like a password and scope the
secret to the repository that needs it.

### Workflow

```yaml
# .github/workflows/deploy-ui.yml
name: Deploy UI
on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read

concurrency:
  group: deploy-ui
  cancel-in-progress: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    steps:
      - uses: actions/checkout@v4
        with:
          persist-credentials: false
      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: 21
          cache: maven
      - name: Build the bundle
        run: mvn -B -ntp package -Dmateu.bundle.static=true
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - name: Deploy to Netlify
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
        run: |
          if [ -z "$NETLIFY_AUTH_TOKEN" ] || [ -z "$NETLIFY_SITE_ID" ]; then
            echo "::notice::Netlify secrets not configured; skipping the deploy."
            exit 0
          fi
          # A pinned version, installed outside the project, without install scripts.
          npm install --prefix "$RUNNER_TEMP/netlify" --no-save --ignore-scripts netlify-cli@<version>
          "$RUNNER_TEMP/netlify/node_modules/.bin/netlify" deploy \
            --dir=target/mateu-bundle --prod --no-build \
            --site "$NETLIFY_SITE_ID" --auth "$NETLIFY_AUTH_TOKEN" \
            --message "${GITHUB_SHA::9}"
```

A few choices in it are deliberate:

- **Pin netlify-cli** to an exact version instead of `npx netlify-cli@latest`, and install it with
  `--ignore-scripts` outside the project: a deploy step holds a token that can publish your site.
- **`--no-build`**: the bundle is already built; don't let the CLI try to run a build of its own.
- **Skip, don't fail, without secrets**: forks and pull requests from forks have no access to
  secrets, and a red build for that reason helps nobody. Pull requests can still run the build
  step to prove the bundle builds.
- **Re-pointing without rebuilding**: to deploy the same screens against another environment, build
  with `-Dmateu.bundle.environment=pro` (see [Environments](/deploy/environments/)); the screens'
  `structureHash` stays the same.

The documentation you are reading is deployed exactly this way: the repository's
`.github/workflows/docs.yml` builds the site, checks every internal link and, on master and on each
release, runs `netlify deploy --prod --no-build` with the same two secrets.

## Custom domain and HTTPS

Add the domain in Netlify › Domain management and point DNS at it (a `CNAME` to
`<site>.netlify.app`, or Netlify DNS). Netlify provisions the certificate. Remember to add the new
origin to the CORS allow-list of every API the bundle calls.

## Related

- [Static bundle](/deploy/static-bundle/) and [A 100 % static UI](/deploy/static-ui/)
- [Production checklist](/deploy/production-checklist/) — CSP and CORS apply to static sites too
