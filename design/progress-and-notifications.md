# Progress and notifications — two UX patterns, one wire (3.0, before rc.1)

Status: implemented on `feat/progress-reporting`. All new API is `@Experimental`.

## Why

Until now both were plumbing, not patterns:

- **Progress** was a `LongTask` that built a modal `Dialog` server-side and streamed state
  fragments into it. Every renderer had to draw a dialog, one at a time, inside the content. In
  IntelliJ progress belongs to the platform's background-task indicator (status bar, cancel, task
  list); on a phone it is a strip; on the web it should not block the page unless the task says so.
- **Notifications** were a toast (`MessageDto`) with a web-only `position` and one hard-coded Undo
  action, plus a pull-only inbox (`NotificationsSupplier`) with no actions, no detail, no grouping
  and no push.

Rule for both: **the server says WHAT happens (semantics), the renderer decides HOW (presentation,
native to its platform).**

## Pattern model

References (patterns, not style): Material 3 *Progress indicators* and *Snackbar*; Fluent 2
*ProgressBar*, *Toast* and *MessageBar*; Carbon *Notifications* (toast / inline / actionable,
"notification panel") and *Progress indicator* / *Loading*; IntelliJ Platform UI Guidelines
*Progress indicators* (background tasks, "Background" button on modal progress, status-bar task
list) and *Notifications* (balloon, sticky balloon, tool window "Notifications", actions in
balloons); Apple HIG *Progress indicators* and *Notifications* (grouping, actionable notifications).

### Progress (a "task")

| Concept | Meaning | Wire |
|---|---|---|
| Task | one unit of long work, identified by `taskId`; several can run at once | `Progress` command, keyed by `taskId` |
| Determinate / indeterminate | `fraction` 0..1, or `null` = indeterminate | `fraction` |
| Step count | "12 of 300" when the work is countable | `done`, `total` |
| Elapsed | renderer-side from `startedAt` (server epoch ms) | `startedAt` |
| ETA | **not sent**: honest ETAs need a model of the work. Renderers may show elapsed only. | — |
| Blocking | the user should wait (modal surface) | `blocking` |
| Move to background | a blocking task the user may send to the task center (IntelliJ "Background") | `backgroundable` |
| Cancel | the user may stop it | `cancellable` → `_progress-cancel` |
| Result | `done` / `failed` / `cancelled`, final title/text, `error` | `state`, `error` |
| Result action | "Open report", "View errors" | `resultActions` |
| Retry | a failed task may be re-run (the renderer re-dispatches the action that started it) | `retryable` |
| Auto-dismiss | how long a finished blocking surface stays | `closeAfterSeconds` |
| Task center | per-app list of running + recently finished tasks (count badge) | renderer state |
| Outlives navigation | leaving the screen does not stop or hide the task | renderer: the stream is owned by the task center, not the screen |
| Notify when done | a finished task also posts an inbox entry ("Import finished — 3 errors · View") | an `inbox` Message in the terminal increment |
| A11y | `role=progressbar` + value; start/end announced politely; cancel reachable by keyboard | renderer |

Reload reattach (a reloaded tab picking up tasks still running for its session) is **3.1**: it
needs a per-session replay channel. Today a reload closes the stream, which CANCELS the task
(closing the stream is a cancel — see below), so nothing keeps running unseen.

### Notifications

| Concept | Meaning | Wire |
|---|---|---|
| Severity | success / error / warning / contrast (info) | `MessageDto.variant` (unchanged) |
| Persistence | `toast` (transient), `sticky` (until dismissed), `inbox` (a toast that also lands in the inbox) | `MessageDto.persistence` |
| Position | a HINT only (web corners); renderers may ignore it | `MessageDto.position` (kept) |
| Actions | 0..n `{label, actionId, parameters, route, style}`; Undo is one of them (`style: undo`) | `MessageDto.actions` (+ legacy `undo*` kept) |
| Dedup key | a message with the same `key` replaces the visible one / the inbox entry | `MessageDto.key` |
| Inbox item | `{id, title, text, route, unread, when, category, variant, resolved, actions, hasDetail}` | `AppNotification` (now also `AppNotificationDto`) |
| States | unread → read → resolved (or dismissed = gone from the list) | `unread`, `resolved`, `_notifications-dismiss` |
| Detail | `route` (navigate) or `hasDetail` (the server answers a Drawer/Dialog/anything for `_notifications-open`) | |
| Item actions | run server-side (`_notifications-act`), the supplier usually resolves the item | |
| Grouping / filters | by `category`; filters unread / all / resolved; mark all read; dismiss per item | renderer (client-side over the list) |
| Push | `LiveNotifications.publish(principal, item)` → `NotificationsChanged` on the live-updates stream, only to the target principal's sessions | `NotificationsChanged` command |
| Badge | unread count everywhere the shell has a header/status bar | renderer |
| Timestamps | `when` is formatted by the server (relative or absolute — the app's locale) | `when` |

The client inbox = the server's list (`NotificationsSupplier`) ∪ the session's own entries (an
`inbox` Message, a pushed item the server list does not have yet), deduplicated by id/key. Durable
entries are the app's: Mateu ships UI only.

## Wire (additive, `WIRE_VERSION` stays 3.0)

```
UICommandTypeDto += Progress, NotificationsChanged

ProgressDto { taskId, title, text, fraction?, done?, total?, state: running|done|failed|cancelled,
              blocking, backgroundable, cancellable, retryable, startedAt?, closeAfterSeconds?,
              error?, resultActions: [MessageActionDto] }
MessageActionDto { label?, actionId?, parameters?, route?, style?: primary|secondary|danger|undo }
MessageDto += persistence: toast|sticky|inbox, actions: [MessageActionDto], key?
AppNotificationDto { id, title, text, route, unread, when, category, variant, resolved, actions,
                     hasDetail }
NotificationsChangedDto { notification?: AppNotificationDto, removedId? }   // both null = refetch
```

Each `Progress` command is SELF-CONTAINED (the whole current task state), so a renderer upserts by
`taskId` and never merges partial updates. Commands of a `Progress` carry no `targetComponentId`.

Reserved actions (handled before instance resolution / by app-level runners, so strict mode does
not apply):

- `_progress-cancel {taskId}` — cancels a running task OWNED BY THE CALLER (owner = hash of the
  framework-authenticated identity, every grant included; an anonymous caller's task is cancellable
  by whoever holds its random `taskId`, which acts as the capability). Answers a `Progress
  state=cancelled`; the stream that runs the task also ends with one. Unknown/foreign task → the
  same `cancelled` echo is NOT sent: the answer is empty (indistinguishable).
- Closing the SSE stream cancels the task (Reactor disposes the work flux; `onCancel` runs).
- `_notifications-list`, `_notifications-read {ids|"all"}` (unchanged), and new
  `_notifications-act {id, actionId}`, `_notifications-dismiss {ids}`, `_notifications-open {id}`.

Registry: `ProgressTasks` (core), process-wide, bounded (10 000 tasks, oldest evicted), an entry
lives while its stream runs.

### Old renderers

All in-repo renderers switch together (they ship together, with the server, in one release). A tab
holding an older bundle is told "This app has been updated… Reload" by the version-skew watch
(`X-Mateu-Build`); a renderer that does not know `Progress` ignores the command — the action still
runs, its result commands still apply, only the progress surface is missing. No Dialog fallback is
emitted: it would keep the server-side-dialog shape alive for every renderer.

## Java API (source compatible)

```java
LongTask.create("Importing…")
    .withProgressBar()                 // unchanged: determinate (fraction starts at 0)
    .done("Done", "Import complete")   // unchanged: final title / text
    .closeAfter(2)                     // unchanged
    .withCommand(UICommand.navigateTo("/results"))   // unchanged: run after done
    .background()          // @Experimental — not blocking (default stays blocking)
    .backgroundable()      // @Experimental — blocking, but the user may move it to the task center
    .cancellable()         // @Experimental — + .onCancel(Runnable)
    .retryable()           // @Experimental — a failed run offers Retry
    .resultAction(MessageAction.open("Open report", "/reports/1"))   // @Experimental
    .notifyWhenDone()      // @Experimental — the terminal increment also carries an inbox Message
    .run(progress -> rows.map(r -> progress.step("Imported " + r.name(), r.index(), r.total())));
```

`ProgressReporter.step(text[, title][, fraction])` unchanged; new `step(text, done, total)`.

`Message` gains `persistence`, `actions`, `key` (builder; the 8-component constructor is kept);
`Message.undoable(...)` also fills `actions`. `MessageAction`, `MessagePersistence` new.
`AppNotification` gains `category`, `variant`, `resolved`, `actions`, `hasDetail` (old
constructors kept). `NotificationsSupplier` gains default methods `onNotificationAction`,
`dismissNotifications`, `notificationDetail`. `LiveNotifications.publish(principal, item)` /
`publishToAll(item)` / `remove(principal, id)` / `refresh(principal)` — the in-process bus, like
`LiveHeaderValues`, delivered by the `_live-updates` stream of `@App(liveUpdates = true)`.

Ports: .NET and Python gain the same DTOs, `Message` fields and inbox actions; LongTask is ported
where the port can stream an action (see the ports section of the PR).

## Renderers

| | Progress | Notifications |
|---|---|---|
| Web (libs/mateu, Vaadin) | `mateu-task-center`: blocking → modal-looking overlay with a progressbar (+ Background / Cancel); background → header/FAB indicator with a count opening the task list; finished → result + actions/Retry | toast with N actions, sticky/inbox, dedup by key; bell with categories, filters, item actions, dismiss, detail; live push |
| Redwood | `oj-progress-bar` in an `oj-dialog` (blocking) or a docked task panel | `oj-c-message-toast` with actions; inbox panel actions/filters |
| React Native | modal with Paper ProgressBar (blocking); collapsible strip "3 tasks running" + bottom sheet | Snackbar with actions; inbox screen with filters/actions; no OS notification (no expo-notifications dependency → 3.1) |
| IntelliJ | `Task.Backgroundable` / `Task.Modal` (platform indicator, cancel, multiple tasks natively) | platform `NotificationGroup "Mateu"`: balloons with actions (toast/sticky), the Notifications tool window for inbox items |

As shipped: the web task center sits bottom-start (the FAB rail is bottom-end), the Redwood dock
too; IntelliJ uses `Task.Modal` / `Task.Backgroundable` (`PerformInBackgroundOption.DEAF` for a
backgroundable one) and five notification groups (messages / sticky / inbox new / inbox / errors),
keeping a minimal "Notifications (n)" button that opens the tool window (the platform badge counts
every IDE notification, not the app's unread entries); clearing an entry in the tool window marks
it read, never dismisses it. The IntelliJ inbox has no filter/grouping UI (the tool window is the
list; the category prefixes the title).

## Moved to 3.1

- Reattaching a reloaded tab to tasks still running for its session.
- ETA.
- OS-level notifications: Web Notifications API (opt-in) and RN local notifications
  (needs a native module → a new store build).
- Server-side inbox persistence of `inbox` Messages (the app's `NotificationsSupplier` owns storage).
