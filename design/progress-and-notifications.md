# Progress and notifications — two UX patterns, one wire (3.0, before rc.1)

Status: implemented on `feat/progress-reporting`; the items first planned for 3.1 (reattach, ETA,
OS notifications, server-side inbox storage) completed on `feat/progress-notifications-complete` —
see "Completed in 3.0". All new API is `@Experimental`.

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
| ETA | the SERVER estimates it from the observed rate, only for determinate running tasks and only once it is honest (see "ETA") | `etaSeconds` |
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

| Survives reload | a reloaded tab (or a renderer that lost its stream) picks up the tasks still running for its session | `_progress-tasks` + `_progress-resume`, grace period (see "Reattach") |

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
- Closing the SSE stream no longer cancels the task at once: with no subscriber left the task runs
  on for the reattach grace period (default 60 s), then it is cancelled (Reactor disposes the work
  flux; `onCancel` runs). See "Reattach".
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

## Completed in 3.0 (first planned for 3.1)

The four items first deferred to 3.1 landed before rc.1 (`feat/progress-notifications-complete`).
All new API is `@Experimental`; the wire additions are additive (`WIRE_VERSION` stays 3.0) and
listed under "Wire additions" below.

### Reattach (a task survives reload and navigation)

Server — a stream that reports a task becomes HOT: the work runs once and its increments are
multicast to every subscriber of the task (the stream that started it, and any resume stream).

- `ProgressTasks` keeps the task while it runs (bounded registry, unchanged) and, once it has
  finished, its terminal `Progress` and the messages of its terminal increment for the grace
  period — a tab that reloads just as the task ends still learns how it ended.
- **Grace period**: when the last subscriber goes away while a task runs, a timer starts; a resume
  stream that subscribes in time stops it; when it fires the task is cancelled as before
  (`onCancel` runs, the stream ends `cancelled`). A stream that reports NO task keeps the old
  behaviour: closing it disposes the work at once. Setting: Java
  `mateu.progress.reattach-grace-seconds` (env `MATEU_PROGRESS_REATTACH_GRACE_SECONDS`), .NET
  `MateuOptions.ProgressReattachGraceSeconds`, Python `add_mateu(progress_reattach_grace_seconds=…)`
  (same env var); default **60**, `0` = the old behaviour (closing the stream cancels the task).
  In-process, like the registry: in a cluster the resume must reach the node running the task
  (sticky sessions).
- `_progress-tasks {taskIds: [...]}` (reserved, app-level, any route, sync or SSE): answers ONE
  increment whose commands are a `Progress` for each listed id that is a task OF THE CALLER (same
  owner rule as cancel) still running or finished within the grace period — its current (or
  terminal) state. Unknown, expired and foreign ids are simply absent (indistinguishable). At most
  50 ids are looked at.
- `_progress-resume {taskId}` (reserved, over `POST …/mateu/v3/sse/{any route}`): streams the
  caller's task — first one increment with its current `Progress`, then the task's later increments
  REDUCED to their page-level parts (`Progress` and `NotificationsChanged` commands, messages); the
  fragments, banners, app state/data and other commands are dropped: they were addressed to the
  screen that started the task, which the resuming client no longer has. Ends after the terminal
  `Progress`. A finished task: its terminal `Progress` + the messages of its terminal increment,
  then the end. Unknown / foreign: an empty stream. Neither reserved action is tracked again (a
  resume stream ending is not a task ending).

Client — each renderer remembers the tasks its streams report, for the SESSION only:

- web (libs/mateu → Vaadin and every shell): `sessionStorage['mateu-progress-tasks']` via
  `safeStorage` — `[{taskId, baseUrl, route, serverSideType}]`, added when a stream first reports a
  running task, removed once its terminal state has been applied. On boot it asks
  `_progress-tasks` per base url, upserts the answers into the task center and opens a
  `_progress-resume` stream for each running one; ids not answered are forgotten. Redwood: the same
  key and flow in `poc/`.
- React Native: in memory per `MateuSession` (survives navigation and screen remounts); the tasks
  whose stream broke are resumed when the app returns to the foreground (`AppState` → active).
- IntelliJ: in memory per app (IDE session); a view/app reload resumes them into the platform's
  background indicator.

A reattached task's result actions with a `route` still navigate; its `actionId` result actions,
Retry and the `withCommand` commands need the screen that started it, so they are not offered after
a reload.

Security (tests in every backend): reattach follows the cancel rules — the owner is the hash of the
authenticated identity, every grant included; a foreign `_progress-tasks` id is absent and a foreign
`_progress-resume` is an empty stream, exactly like an unknown one; anonymous callers share one
owner, so for them the random task id is the capability (it is only ever sent to the tab that
started the task, and kept in that tab's session storage).

### ETA

`ProgressDto.etaSeconds` (Integer, null = none) is stamped by the SERVER on each running
`Progress` it streams (`ProgressTasks` → `EtaEstimator`, .NET/Python twins): it sees every update
of the task in order, on the work's own clock, and a reattached client gets the estimate at once.
Rules (corpus `conformance/progress/eta.json`, generated by `eta.generate.mjs`, run by the three
backends): determinate only (`fraction`, else `done/total`); an exponentially smoothed rate
(α = 0.3) of the segments that advance; an estimate only after 2 rate updates and 2 s since the
first sample, and while 0 < p < 1; going backwards starts over; never for indeterminate or finished
tasks. Renderers word it (corpus `conformance/client/eta-format.json`): "less than a minute left" /
"about 2 min left" / "about 1 h left" (es: "menos de un minuto" / "unos 2 min restantes" / "unas 1
h restantes") — web `chromeTexts` (`taskEtaUnderMinute`, `taskEtaMinutes`, `taskEtaHours`), Redwood
`poc/i18n.mjs`, React Native and IntelliJ text tables.

### OS-level notifications

Opt-in per app: `@App(osNotifications = true)` → `AppDto.osNotifications` (.NET `[App(OsNotifications
= true)]`, Python `@app(os_notifications=True)`). Two events are worth leaving the app for: a NEW
unread inbox entry (pushed, or an `inbox` Message) and a task that finished (done/failed) while it
was in the background (non-blocking, or moved there). Shown only while the app is not in front.

- Web (libs/mateu, Redwood): the Web Notifications API. Permission is asked ONLY from a user
  gesture — a "Notify me on this device" control in the bell and in the task center, shown while
  the permission is `default`; never on load. Shown while `document.visibilityState === 'hidden'`;
  `tag` = entry id / task id (several tabs of the app collapse into one notification); a click
  focuses the tab and opens the entry's route.
- React Native: `expo-notifications`, LOCAL notifications only (no push service, no token, no
  server). Permission asked from the inbox screen / task sheet; shown while `AppState` is not
  `active`. A native module → a new store build (versionCode 200003 / iOS buildNumber; see
  `frontend/app/react-native/RELEASE.md`).
- IntelliJ: the platform already turns balloons into system notifications while the IDE is not
  focused (Settings › Appearance & Behavior › Notifications › "Use system notifications"); for an
  app that opts in, the two events also post through `SystemNotifications` when the frame is
  inactive.

### Server-side inbox storage

Mateu ships UI only, so the store is an INTERFACE the app may implement — `InboxStore`
(`io.mateu.uidl.interfaces`, .NET `IInboxStore`, Python `InboxStore`): `add(principal, entry)`,
`list(principal)`, `markRead(principal, ids)`, `dismiss(principal, ids)`. Mateu's default is in
memory, per process, bounded (100 entries per principal, newest kept; 10 000 principals, least
recently used first) and lost on restart; an app bean/service replaces it.

- An `inbox` Message in ANY answer (an action, a task's terminal increment — `notifyWhenDone`) of
  an AUTHENTICATED caller is stored for that principal: id = the message's `key`, else
  `inbox-<uuid>` (the key is then stamped on the wire message, so the session entry and the stored
  one are the same entry); title, text, variant; `when` = server local time `yyyy-MM-dd HH:mm`;
  actions = the message's actions that carry a `route` (an `actionId` needs the screen that sent
  it); unread. Then `LiveNotifications.publish(principal, entry)` reaches the principal's other
  sessions (with `@App(liveUpdates = true)`; otherwise at the next list). An anonymous caller's
  inbox messages stay session-only (no principal to store them for).
- `_notifications-list` = the supplier's list ∪ the store's (supplier first; a store id the
  supplier already lists is skipped); `read`/`dismiss` route the store's ids to the store and the
  others to the supplier (own-ids rule unchanged); a stored entry offers no `actionId` action and no
  detail, so `act`/`open` refuse it like any entry that does not offer them.
- The bell shows when the app implements `NotificationsSupplier` OR declares `@App(inbox = true)`
  (no supplier: the bell lists the store only) — .NET `[App(Inbox = true)]`, Python
  `@app(inbox=True)`.

### Wire additions

```
ProgressDto += etaSeconds?: int        // server-estimated, running + determinate only
AppDto      += osNotifications: bool   // the app opts in to OS-level notifications
            (AppDto.notificationsEnabled is now also true for @App(inbox = true))
```
