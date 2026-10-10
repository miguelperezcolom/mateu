---
title: "Environments"
description: "Point the REST source catalogue at pre, pro or a local stack without editing sources.yaml."
---

The [REST source catalogue](/java-ui-definition/rest-source-catalogue/) declares each endpoint
once. An **environment** says where those endpoints live in one deployment — `pre`, `pro`, a
developer's laptop — **without editing `sources.yaml`**:

```yaml
# specs/ui/environments/pre.yaml
sources:
  orders:   {baseUrl: https://pre.api.acme.com}
  payments: {url: https://pre.pay.acme.com/v1/payments, proxy: true}
  crm:
    headers: {X-Api-Key: "${secret.CRM_KEY}"}
```

Run the server with `MATEU_ENVIRONMENT=pre` (or `-Dmateu.environment=pre`) and those three sources
are re-pointed; everything else stays as authored.

## The files

Two spellings, the same thing:

- **By convention**: `specs/ui/environments/<name>.yaml`. The file name is the name; `type:` and
  `name:` may be omitted.
- **Anywhere under `specs/ui/`**: a file with `type: Environment` and a `name:`.

`sources:` maps a source **name** from the catalogue to what this environment changes about it.
Naming a source the catalogue does not declare logs a warning.

## What can be overridden

| Key | Effect |
|---|---|
| `baseUrl` | replaces the **origin** of the source's url, keeping its path and query |
| `url` | replaces the whole url (wins over `baseUrl`) |
| `headers` | merged over the source's headers — this environment's value wins per header |
| `proxy` | replaces the `proxy` flag |

Only these. **Method, body, `itemsPath`/`valuePath`/`labelPath`, `fields`, `totalPath` are not
overridable**: they describe the *contract* — what the screens send and read — and that is the same
in every environment. An environment changes the *deployment* of an endpoint, never its shape; if
`pre` answered a different shape, it would be a different source.

### How `baseUrl` rebases a url

| Source `url` | `baseUrl` | Result |
|---|---|---|
| `https://api.acme.com/v1/orders` | `https://pre.api.acme.com` | `https://pre.api.acme.com/v1/orders` |
| `https://api.acme.com/v1/orders?status=open` | `https://pre.api.acme.com/` | `https://pre.api.acme.com/v1/orders?status=open` |
| `https://api.acme.com/v1/orders` | `https://pre.acme.com/gateway` | `https://pre.acme.com/gateway/v1/orders` |
| `/api/orders` (relative) | `https://pre.acme.com` | `https://pre.acme.com/api/orders` |
| `https://api.acme.com/orders/${state.id}` | `http://localhost:8090` | `http://localhost:8090/orders/${state.id}` |

A trailing slash on `baseUrl` is ignored, and placeholders survive untouched.

## Activating one

- **A server**: `-Dmateu.environment=pre` or the environment variable `MATEU_ENVIRONMENT=pre`. No
  environment, or a name no file declares (warned), leaves the catalogue as authored.
- **A static bundle**: the `mateu-bundle` goal's `environment` parameter,
  `-Dmateu.bundle.environment=pre`.

The overlay is applied once, to the merged catalogue every leg reads, so it reaches all of them:
the catalogue on the wire (`AppDto.restSources`, used by the browser for direct calls), the
server-side **proxy**, and the bundle's `manifest.json` (which also records the `environment` it
was built for).

## Re-pointing a deployed bundle

A static bundle carries the resolved catalogue once, in `manifest.json`'s `sources`. To move it to
another environment, either:

- **rebuild with another environment** — `-Dmateu.bundle.environment=pro`. Only the catalogue
  changes: the bundle's `structureHash` ignores it, so the bundle still identifies as the same build
  of the same screens; or
- **edit `manifest.json`'s `sources`** on the host — no rebuild at all.

## Secrets never go here

An environment file is checked in and, for a bundle, shipped. **Never put a credential in it.**
Write a `${secret.X}` placeholder and give the value to the server as `MATEU_SECRET_X`; only the
server-side **proxy** resolves secrets, so a source that needs one must be `proxy: true` (the
browser has no secret scope, and a secret in a static file is not a secret). A credential-looking
header (`Authorization`, `*api-key*`, `*token*`, `*secret*`) with a literal value is warned about
when the file is read.

## See also

- [The REST source catalogue](/java-ui-definition/rest-source-catalogue/).
- [Deploy to production](/java-user-manual/build/deploy-to-production/) — environments and secrets.
- [Permissions in YAML](/java-ui-definition/yaml-security/) and [Translations in YAML](/java-ui-definition/yaml-i18n/).
