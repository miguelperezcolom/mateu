---
title: Record presence
description: Who else has the record you are looking at open — and who is editing it — so two people do not overwrite each other.
---

**Status:** ✅ Implemented · `@Experimental`

## Intent

Two people open the same order. One changes the delivery date, the other the address, and the
second save is refused (`@Version` already does that) — after the work is done. Presence warns
*before*: a small line in the page header says **"Ana is editing this record"** on a warning tone,
or **"Bob is viewing it"** when someone is only looking.

## Solution

Turn it on for the app:

```java
@UI("")
@App(presence = true)
public class Shell { … }
```

That is all. Every record page of the app — a CRUD record (view or edit), an `EditableView`, a
YAML record page — takes part; nothing is declared per screen.

| Concept | What Mateu uses |
|---|---|
| The record | its **route** (mount-relative; `orders/7`, `orders/7/edit` and `orders/7/view` are the same record) plus the page's view class — no new id concept. A create page (`…/new`) is no record yet. |
| Who | the name of the identity the **host framework authenticated** (see [security](/java-user-manual/advanced/security/#how-authorization-works)); a `PrincipalResolver` can make it a full name. An anonymous caller neither shows nor sees anyone. |
| Viewing / editing | editing = the page holds **unsaved changes** (the same flag the [unsaved-changes guard](/reference/key-annotations/) uses). |
| The app | presence of one app (base url + app class) never reaches another, nor another record. |

On the web, a page counts as a record page when its route has two or more segments
(`orders/7`) — or, for a one-segment route (`profile`), when the page edits (it asks to confirm
leaving with unsaved changes). A listing or a dashboard shows nobody.

### How it travels

- Each record page reports itself with the app-level action `_presence` (`viewing`, `editing` or
  `leave`) every **10 s**, and once more at once when it starts or stops editing. The answer lists
  the **other** people on the record — one entry per person, editing if any of their tabs edits;
  you are never in it.
- The others hear the change **at once** through the app event stream — the same single
  `_live-updates` stream per browser that [live header values](/ux-patterns/live-header-values/)
  use (one leader tab holds it and relays to the others). `presence = true` opens that stream even
  without `liveUpdates`.
- A tab not seen for **30 s** is gone: a closed tab disappears even when its `leave` never arrived.
- When someone **starts** editing, it is announced to screen readers once, politely ("Ana started
  editing this record").

### A cluster

Out of the box presence is kept **in memory, per process** — bounded: 10 000 open records, 50 copies
per record, 50 per user; beyond a bound a new copy is simply not shown. Two users on different nodes
do not see each other. Mateu ships UI only, so sharing it is an interface the app implements:

```java
@Component
class RedisPresenceStore implements PresenceStore {
    public boolean touch(String scope, String record, PresenceMember member) { … }
    public void leave(String scope, String record, String principal, String tab) { … }
    public List<PresenceMember> members(String scope, String record, Instant seenAfter) { … }
    // optional: expire(...) when the store has no TTL of its own,
    //           onChange(...) to push changes at once (else they show on the next heartbeat)
}
```

### In YAML

```yaml
type: AppShell
presence: true
```

### C# and Python

```csharp
[UI("")]
[App("Orders", Presence = true)]
public class Shell { }
// a shared store: services.AddSingleton<IPresenceStore, MyStore>();
```

```python
@ui("")
@app("Orders", presence=True)
class Shell: ...
# a shared store: add_mateu(api, module, presence_store=MyStore())
```

## Where it works

- **Vaadin** — a chip in the page header, under the title (`mateu-presence-chip`): avatars with
  initials and the line; a warning tone when someone edits.
- **React Native** — a line above the record screen.
- **IntelliJ plugin / desktop app** — a line in the page header; the editing state is reported on
  the heartbeat.
- **Redwood (Oracle VB)** — not yet: the flag is on the wire, the renderer ignores it.

## Related

- [Live header values](/ux-patterns/live-header-values/) — the same event stream
- [Optimistic locking](/reference/key-annotations/) — `@Version` still refuses the second save
