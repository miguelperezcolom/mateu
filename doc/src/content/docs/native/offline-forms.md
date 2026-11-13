---
title: "Offline forms on the phone"
description: "Let the Mateu app keep a write made without connection and send it — once — when the connection is back: @Action(offline = QUEUE), the Idempotency-Key contract the servers honour, and what the user sees."
---

:::caution[Experimental]
The offline send queue is **experimental** (3.0 GA): the declaration, the wire field and the header
may still change in a minor release.
:::

A warehouse, a basement, a lift: the user fills a form on the phone, presses **Save** and there is no
signal. By default that save fails, as it does on the web — the change has not been sent and the
user is told so. For the writes that still make sense **later**, the [Mateu app](/native/react-native)
can keep them in a **send queue** and send them when the connection is back.

It is **opt-in, per action**: only an action that declares it is ever queued.

## Declare it

```java
@Button
@Action(offline = OfflinePolicy.QUEUE)
public Message save() {
  stock.record(location, counted);
  return Message.success("Count saved");
}
```

| Language | Declaration |
| --- | --- |
| Java (annotation) | `@Action(offline = OfflinePolicy.QUEUE)` |
| Java (fluent) | `Action.builder().id("save").offline(OfflinePolicy.QUEUE)` |
| YAML (`actions:` of a definition) | `offline: QUEUE` |
| C# | `[ActionOptions(Offline = OfflinePolicy.Queue)]` |
| Python | `@action_options(offline=OfflinePolicy.QUEUE)` |

The action then travels with `offline: "queue"` on the wire (`ActionDto.offline`; absent otherwise).

**Only for writes that still make sense later**, possibly after other changes happened in between: a
stock count, a delivery note, an inspection report, a meter reading. Not for anything whose outcome
depends on the moment it runs (booking a slot that may no longer be free, a payment): leave those
failing, so the user decides.

## What the user sees

1. They press Save without connection (or the server does not answer in time). The app keeps the
   request and says **"Pending — will be sent when you're back online."** The form keeps what they
   typed.
2. While something is waiting, a strip at the bottom of the screen says how many changes are
   pending, with **Send now** and **View**. *View* lists them; each one can be **cancelled**.
3. The UI's row in the app's list (the hub) shows **"N changes pending"**.
4. When the connection comes back — or the UI is opened, or the app returns to the foreground — the
   app sends them **in order, one at a time**, and says how many were sent.
5. If the server **refuses** one (a validation error, a 4xx, an error message), the queue **stops
   there** and shows why: what follows it may depend on it. The user can **Try again** (after fixing
   things elsewhere) or **Cancel** it.
6. If the sign-in **expired**, the app asks to sign in again and then sends it. If that cannot
   happen right now, the item keeps waiting and the user is told to sign in.

A queued item belongs to its UI: removing the UI from the list drops what it had waiting.

## The contract with the server — `Idempotency-Key`

A queued write replays later, and the app may not know whether the first attempt arrived: when a
request **times out**, the server may well have processed it and only the answer was lost. So every
attempt of a queueable action — **the first one included** — carries the same key:

```http
POST /mateu/v3/sync/count
Idempotency-Key: 6f1c2b9e-3d4a-4c1f-9b7e-2a8d5c0e1f34
```

The Java, .NET and Python servers honour it on the sync endpoint:

- A request with a key runs **once per caller, action and key**. A repeat of the same key gets the
  **first answer back** and the action does **not** run again; a repeat arriving while the first run
  is still in flight waits for it and gets its answer.
- The **caller** is the SAME identity your access checks read — Java's `IdentityResolver` (a
  `PrincipalResolver` bean or the framework's principal), .NET's `MateuOptions.Identity`, Python's
  `identity_provider` — taken whole: name, roles, groups, scopes and permissions, sorted and hashed.
  One user's key never answers another user's request, and a caller whose grants changed (a
  permission revoked) is not served the answer remembered for the old ones: the request runs again
  and meets the action's checks. The **action id** is part of the scope too. On .NET, a custom
  `MateuOptions.Identity` that does not read `HttpContext.User` should set `Identity.Name`, or two
  users with the same grants look alike.
- Java consults the keys only after the request-level checks (exposed type, YAML route/action
  access), so a refused request is never answered from memory.
- A run that **fails** — an exception, or an answer carrying an error message (a refusal, the error
  boundary's) — is **forgotten**, so the same key can be sent again once the problem is fixed.
- A key is 8–128 url-safe characters (`[A-Za-z0-9_\-:.]`); anything else is ignored (the request runs
  as if it had none). The app sends a v4 UUID.
- Keys are remembered **in memory, per process** — lost on a restart — in two tables:
  - **runs in flight** are never evicted (dropping one would let a retry start a second run while the
    first is still working). When 2000 keyed runs are already in flight, a request with a NEW key is
    **refused** with the error *"Too many pending requests — The server is still processing too many
    requests. Try again in a moment."* The app keeps the item queued and sends it again later; a
    repeat of a key already in flight always joins its run.
  - **finished answers**: at most 2000 (least recently used first out), each for 24 hours. After that
    the key is forgotten and a repeat would run again.

  Tune both with `mateu.idempotency.max-entries` / `mateu.idempotency.ttl-seconds` (Java),
  `MATEU_IDEMPOTENCY_MAX_ENTRIES` / `MATEU_IDEMPOTENCY_TTL_SECONDS` (.NET, Python).

:::note[Several instances]
The memory is per process: it does not survive a restart and is not shared. Behind a load balancer,
the retries of one device must reach the same instance (sticky sessions) for the guarantee to hold
across instances; a retry that lands after a restart, on another instance or after the 24 hours runs
the action again. This is a best-effort guard, not a persistent exactly-once guarantee. If your write is naturally
idempotent (an upsert by a client-generated id), you can also read the header yourself
(`HttpRequest.getHeaderValue("Idempotency-Key")`) and deduplicate in your own store.
:::

The header is honoured for any action that sends it, not only queued ones; only the app sends it
today, and only for actions declared `offline = QUEUE`. With a key, the app also repeats the request
after a timeout or a 5xx (the server deduplicates), which it never does for an ordinary write.

## Storage and security

- The queue lives on the device in the platform **keychain / keystore** (`expo-secure-store`,
  encrypted at rest), split in chunks because a secure-store value is small. On the web build of the
  app it is the browser's `localStorage`, like the sign-in tokens there.
- Only the **request body** is stored — the form's state, the action, the route, the parameters.
  **Never** a token or a header: the request is signed with the token current when it is sent.
- A queue holds at most 50 items and 64 KB per item (a form with a large photo is not kept: it fails
  as before).
- Only the UI's own backend: an action of a remote island (another backend) is not queued.
- A static UI (a bundle with no server) never queues: it has nobody to send it to.

## What is not covered

- The **web renderers** ignore the declaration: a browser tab without connection fails as before.
- **Streamed actions** (`@Action(sse = true)`, a `LongTask`) are not queued.
- Nothing is merged: if the record changed on the server in between, your action's own rules decide
  (e.g. an optimistic `@Version` check refuses it, and the refusal is shown).
