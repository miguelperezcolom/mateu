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
6. If the sign-in **expired**, the app refreshes it silently and sends it. If that cannot happen,
   the item keeps waiting and the user is told to sign in again; it goes once they have.
7. If the stored queue **could not be read back** whole, it is never shown as an empty list — see
   [below](#when-the-stored-queue-cannot-be-read).

A queued item belongs to its UI: removing the UI from the list drops what it had waiting.

## Whose queue it is — one per signed-in person

A queued request is sent later with the sign-in that is current **then**, so a queue belongs to the
person who filled it — its **owner** — and to nobody else:

- On a UI that signs in, the owner is the signed-in identity: the **issuer** and **subject** (`iss`,
  `sub`) of the id token — or of a JWT access token when there is no id token — plus the **tenant**
  when the token names one (`tid`, `tenant_id`, `tenant`). A renewed or refreshed token of the same
  person is the same owner. On a UI with no sign-in, everything goes to one anonymous queue, as
  before. A sign-in whose tokens do not say who it is (no JWT at all) queues nothing: those writes
  fail as an ordinary write does.
- Each owner has **their own queue** on the device. Before **each** send the app checks that the one
  signed in now is the queue's owner; otherwise nothing is sent. A send that has to refresh an
  expired token does it **silently** and is repeated only if the same person is still signed in —
  it never opens the sign-in browser on its own.
- **Signing out suspends** the queue: it stays on the device, untouched — not sent, not shown and not
  counted in the hub's badge. Someone else signing in to the same UI starts with an empty queue of
  their own and sees nothing of it. When the **same person** signs in again, their queue is back and
  is sent.
- The hub's **"N changes pending"** counts only the queue of whoever is signed in to that UI now.

## When the stored queue cannot be read

The queue is written so that an interrupted write (the app killed half-way, a full keychain) never
mixes two versions: each new version is written in full under a new **generation**, one pointer is
then switched to it, and only after that is an older version deleted. Every version carries its
length and a checksum, checked when it is read back.

- If the **latest version** does not read back whole, the app falls back to the **previous one**
  and says so: *"The list of pending changes was restored from its previous copy. Check that it is
  complete."* (a change made just before may be missing, or one already sent may be back — the
  server's `Idempotency-Key` handling keeps a repeat from being applied twice).
- If **no version** can be read, the queue is shown as **damaged** — never as an empty list: *"Your
  pending changes saved on this device could not be read. They cannot be sent."*, with **Discard
  them** (asked for confirmation). Until the user discards it, nothing new is written over it — a
  write made offline in the meantime is not kept, and the user is told why.
- A keychain that cannot be read right now (a locked device) is not damage: nothing is shown or
  written, and the next use reads it again.

These messages are in the app's chrome language (English, Spanish, French, German, Portuguese,
Italian).

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
- The **caller** is the identity your app authenticated (name and every grant, hashed) — one user's
  key never answers another user's request. The **action id** is part of the scope too.
- A run that **fails** — an exception, or an answer carrying an error message (a refusal, the error
  boundary's) — is **forgotten**, so the same key can be sent again once the problem is fixed.
- A key is 8–128 url-safe characters (`[A-Za-z0-9_\-:.]`); anything else is ignored (the request runs
  as if it had none). The app sends a v4 UUID.
- Keys are remembered **in memory, per process**: at most 2000 answers (least recently used first
  out) for 24 hours. Tune with `mateu.idempotency.max-entries` / `mateu.idempotency.ttl-seconds`
  (Java), `MATEU_IDEMPOTENCY_MAX_ENTRIES` / `MATEU_IDEMPOTENCY_TTL_SECONDS` (.NET, Python).

:::note[Several instances]
The memory is per process. Behind a load balancer, the retries of one device must reach the same
instance (sticky sessions) for the guarantee to hold across instances. If your write is naturally
idempotent (an upsert by a client-generated id), you can also read the header yourself
(`HttpRequest.getHeaderValue("Idempotency-Key")`) and deduplicate in your own store.
:::

The header is honoured for any action that sends it, not only queued ones; only the app sends it
today, and only for actions declared `offline = QUEUE`. With a key, the app also repeats the request
after a timeout or a 5xx (the server deduplicates), which it never does for an ordinary write.

## Storage and security

- The queue lives on the device in the platform **keychain / keystore** (`expo-secure-store`,
  encrypted at rest), one per UI and owner, split in chunks because a secure-store value is small,
  written generationally (see above). On the web build of the app it is the browser's
  `localStorage`, like the sign-in tokens there.
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
