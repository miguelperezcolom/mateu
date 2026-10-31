---
title: "ContentSlot"
---

A hole for **managed content** — a help text, a notice, an editorial block — filled by a content
service and resolved by the host **while it builds the view**. It is a [MicroFrontend](/java-ui-definition/components/micro-frontend/)
with `resolve = SERVER` pointed at the content service, plus three guarantees: a stable key, a
declared fallback and a registry of every slot, generated at compile time.

:::caution[Experimental]
`@ContentSlot` and the server-side resolution it rides on are experimental (`@Experimental`):
they may change in a minor release.
:::

## Usage

```java
@UI("/home")
public class Home {

  @ContentSlot(
      key = "front-office.home.destacado",
      fallback = "No news today",   // blank = the slot is not painted
      timeoutMs = 100,
      description = "Banner at the top of the home page")
  String destacado;
}
```

The field's value is irrelevant: the field marks where the slot goes. Fluent and YAML:

```java
ContentSlot.builder().key("front-office.home.destacado").fallback("No news today").build()
```

```yaml
- type: ContentSlot
  key: front-office.home.destacado
  fallback: No news today
```

## What it guarantees

- **Stable key** — `application.screen.name`: lower case letters, digits and dashes, dot-separated,
  at least three segments (more are allowed: the last is the name, the ones in between the screen).
  Checked at compile time with the indexer annotation processor: a malformed key or one used twice in
  the module is a **compile error**. Changing a key is a contract change.
- **It never blocks the screen** — an empty slot, a content service that is slow, down or answers an
  error paints the fallback (or nothing). Unlike a plain micro frontend it does **not** degrade to
  the browser asking the content service: the content is accessory, and the browser never receives
  anything the server did not resolve for that user. `degradeToClient = true` opts into it.
- **Registry** — the indexer writes every slot of the module to `META-INF/mateu/content-slots.json`
  (below), which the content service loads to list the slots in its backoffice.

## Configuration

```properties
mateu.remotes=content
mateu.remotes.content.base-url=/_content-hub       # or https://content.acme.com
mateu.remotes.content.identity=forward-authorization
mateu.self-base-url=https://shell.acme.com          # a path remote is called at this server
# defaults:
# mateu.content-slots.remote=content
# mateu.content-slots.route=/content-slots/{key}
```

A content remote that is not registered paints every slot's fallback, with a warning per slot.

## The contract with the content service

The content service is a [registered remote](/java-ui-definition/components/micro-frontend/#registered-remotes)
that speaks Mateu's sync endpoint — a Mateu app, or anything that answers the same JSON.

**Request** — one per slot on screen, in parallel, while the host builds the view:

```http
POST {content base url}/mateu/v3/sync/content-slots/front-office.home.destacado
Content-Type: application/json
Authorization: Bearer …                  (the user's, with forward-authorization)
X-Mateu-Correlation-Id: 4bf92f35…
X-Mateu-Fragment-Keys: 9f2c…,77ab…       (only when the host holds keys for this url, see below)

{
  "route": "/content-slots/front-office.home.destacado",
  "actionId": "",
  "consumedRoute": null,
  "serverSideType": null,
  "componentState": {},
  "appState": {},
  "initiatorComponentId": "mfe___content_hub__content_slots_front_office_home_destacado__"
}
```

**Answer with content** — a Mateu UI increment whose fragments carry the slot's components
(`targetComponentId` = the request's `initiatorComponentId`):

```json
{
  "fragments": [{
    "targetComponentId": "mfe___content_hub__content_slots_front_office_home_destacado__",
    "action": "Replace",
    "component": { "type": "ClientSide", "id": "c", "children": [],
                   "metadata": { "type": "Text", "container": "div", "text": "Summer offers are live" } },
    "state": {}, "data": {}
  }],
  "fragmentCache": { "maxAgeSeconds": 300, "varyBy": "key", "key": "9f2c…" }
}
```

**Empty** — `204 No Content`, or an answer whose fragments carry no component: the fallback is
painted. **Error or timeout** — any non-2xx, or no answer within the slot's timeout: the fallback is
painted and the call is cancelled.

**Cache** (optional) — `fragmentCache` says what the host may do with the answer: `varyBy` `none`
(never cached — also when absent), `shared`, `user`, or `key` with an opaque `key` (e.g. the hash of
the user attributes the content targets). The host keeps the answer under url + key for
`maxAgeSeconds`, remembers each user's key for as long, and sends the keys it holds in
`X-Mateu-Fragment-Keys`; when the key the service computes for this user is one of them, it may
answer without the fragments:

```json
{ "fragments": [], "fragmentCache": { "maxAgeSeconds": 300, "varyBy": "key", "key": "9f2c…", "notModified": true } }
```

A Mateu content service gets all of this by implementing `FragmentCachePolicySupplier` on the view
that answers (`FragmentCachePolicy.byKey(hash, 300)`): Mateu stamps the policy and strips the
fragments when the host already holds the key.

## The slot descriptor

Each module compiled with the indexer annotation processor carries
`META-INF/mateu/content-slots.json`:

```json
{
  "version": 1,
  "mateuVersion": "3.0-beta.26",
  "slots": [
    {"key": "front-office.home.destacado", "application": "front-office", "screen": "home",
     "name": "destacado", "declaredIn": "com.acme.Home", "field": "destacado", "route": "/home",
     "fallback": "No news today", "description": "Banner at the top of the home page",
     "timeoutMs": 100, "degradeToClient": false}
  ]
}
```

The running app also answers it, merged across all its modules (a key declared by two modules is
listed in `duplicates` and warned about), when `mateu.content-slots.descriptor.enabled=true`:

```http
POST /mateu/v3/sync/_no_route
{"actionId": "__content_slots__", "route": ""}
→ {"appData": {"_contentSlots": {"version": 1, "slots": [...], "duplicates": []}}, ...}
```

It is off by default: it describes the application's screens.
