# Security review — progress reporting and notifications (PR #1080)

Branch reviewed: `feat/progress-reporting` (e0261e00b). Fixes on `sec/progress-notifications-review`,
merged into the feature branch. Scope: Java core + uidl, .NET and Python ports, the web client
(libs/mateu, Vaadin), Redwood `poc/`, React Native and the IntelliJ plugin.

Severity: High = another user's data or actions; Medium = a real exploit path that depends on the
app; Low = defence in depth / DoS with a limited effect; Info = noted, no change.

## Findings

### 1. Inbox actions take the item id and the action id straight from the browser (IDOR) — HIGH (fixed)

**Issue.** `_notifications-act {id, actionId}`, `_notifications-dismiss {ids}`, `_notifications-open
{id}` and `_notifications-read {ids}` are app-level reserved actions (no strict mode, no
`IssuedActions`). All three backends passed the client's `id`/`actionId` to the app's
`NotificationsSupplier` unchecked; the only protection was a Javadoc line ("check it belongs to the
caller"). A supplier that looks an entry up by id — the natural way to write `onNotificationAction`
(`expenses.find(id).approve()`) — let any signed-in user approve/reject/dismiss/open ANOTHER user's
entry by guessing or enumerating ids, and run any action id the supplier switches on, offered or not.

**Evidence.** New tests against the unchanged runners: `_notifications-act {id:"someone-elses",
actionId:"approve"}` reached `onNotificationAction`; `{id:"e1", actionId:"deleteAll"}` (an action
the entry does not offer) too; `dismiss`/`read` passed foreign ids through; `open` returned the
detail of an id not in the caller's list and of an entry without `hasDetail`.

**Fix (the IssuedActions principle, applied to the inbox).** The framework hands the supplier only
what it handed the caller: the entry must be in the list `notifications(rq)` answers for THE SAME
request, and the action id must be one of that entry's `actions`. Otherwise `act` is a 403 with one
WARN (the reason server-side only, indistinguishable for a foreign vs. an unknown entry);
`dismiss`/`read` drop foreign ids silently; `open` answers nothing unless the own entry declares
`hasDetail`. `notifications(rq)` becomes the caller's authority — the Javadoc says so.

- Java `NotificationsActionRunner` (`ownEntry` / `ownIds`), `NotificationsSupplier` Javadoc.
- .NET `SyncHandler.AppLevel.cs` (`OwnEntry` / `OwnIds`, refusal via `ActionGuard.Deny`).
- Python `sync_handler/app.py` (`_own_entry` / `_own_ids`, refusal via `action_guard.deny`).

**Tests.** `NotificationPatternsSyncTest.anActionOnAnEntryNotInTheCallersListIsRefused`,
`…anActionTheEntryDoesNotOfferIsRefused`, `…dismissAndReadOnlyReachTheCallersOwnEntries`,
`…onlyAnOwnEntryThatDeclaresADetailOpensIt`; .NET
`ProgressAndNotificationsTests.An_action_on_an_entry_not_in_the_callers_list_or_not_offered_is_refused`,
`…Dismiss_read_and_open_only_reach_the_callers_own_entries`; Python
`test_notification_patterns.py::test_an_action_on_an_entry_not_in_the_callers_list_or_not_offered_is_refused`,
`…test_dismiss_read_and_open_only_reach_the_callers_own_entries`. All failed before the fix.

### 2. IntelliJ: task texts and notification action labels could render as live HTML — MEDIUM (fixed)

**Issue.** Swing renders any text starting with `<html>` as HTML and fetches its `<img>`s when the
text is set (the plugin's own `PlainText.kt` rule). The new platform presentation put server data on
Swing components without `plain()`: the `Task.Modal`/`Task.Backgroundable` title and the status-bar
indicator lines (`indicatorText`/`indicatorText2` — task title/text, typically built from row data:
`progress.step(row.name())`) and every balloon action link (`NoticeAction.labelFor` — message,
inbox and result-action labels, e.g. "Approve " + requester). A value `<html><img src=…>` was a
tracking beacon / remote fetch from the developer's IDE. The balloon title/content were already
safe (`SafeHtml.escape` / `sanitize`, images limited to `data:`).

**Fix.** `ProgressTasks.indicatorText`, `indicatorText2` and `NoticeAction.labelFor` return
`plain(...)` (shown escaped, as text) — one place covers the task title, the indicator, the balloon
actions and the fallback Undo button.

**Test.** `ProgressTasksTest.testTaskTextsAndActionLabelsAreNeverLiveHtml` (failed before);
`HtmlInDataTest` still green.

### 3. Web: the last relayed inbox entry stayed at rest in localStorage — LOW (fixed)

**Issue.** The leader tab relays a `NotificationsChanged` to the other tabs through
`localStorage['mateu-inbox-change']` and left it there: the last pushed entry (title, text, actions
of the signed-in user) survived sign-out and was readable later on a shared machine.

**Fix.** `liveUpdates.ts` removes the key right after writing it (the write already fired the other
tabs' `storage` event; the removal's event has no `newValue` and is ignored).

**Test.** `liveUpdates.stream.test.ts` "a relayed inbox change is not left behind in localStorage"
(failed before).

### 4. `_progress-cancel` — ownership, enumeration, replay — no issue (tests added)

Task ids are random UUIDs (Java `UUID.randomUUID`, .NET `Guid.NewGuid`, Python `uuid4`); the
registry stores the owner as a SHA-256 of the authenticated name + every grant. A cancel of an
unknown, finished or foreign task answers the same empty increment (no oracle); a replayed cancel
answers nothing. An anonymous caller cannot cancel an authenticated caller's task; anonymous callers
share one identity, so between them the unguessable id is the capability (as documented). New tests:
`ProgressReportingSyncTest.anAnonymousCallerCannotCancelAnAuthenticatedCallersTask` (also: the same
user with other grants, replay), Python
`test_an_anonymous_caller_cannot_cancel_an_authenticated_callers_task`.

### 5. Progress errors — no internals leak — no issue (tests added)

A failing task ends `failed` with the error boundary's text (UserFacingException / validation
message, else "An unexpected error occurred. Reference: …"), never the raw exception, in all three
backends (Java: `ProgressTasks.track` sits after `RunActionUseCase`'s `onErrorResume`; .NET:
`MateuErrors.Increment`, detailed only in Development; Python: `error_boundary.describe`, detailed
only with `MATEU_ERRORS_DETAILED=true`). Tests `aTaskThatCrashesNeverStreamsTheRawException`
(Java) and `test_a_task_that_crashes_never_streams_the_raw_exception` (Python) throw an exception
carrying a fake JDBC URL and password and check neither reaches the wire.

### 6. Rendering of task/notification text — no issue

Web (`mateu-task-center`, `mateu-notification-bell`, `messageToast`, `neutralNotifier`): Lit text
bindings only, no `unsafeHTML`/`innerHTML` in any changed file. Redwood (`tasks.mjs`, `inbox.mjs`,
`notify.mjs`): elements built with `textContent`/`setAttribute`. React Native: `<Text>` only.
IntelliJ: see finding 2.

### 7. Navigation targets (`route`) — no issue

Web: inbox/toast/task routes go through `navigateToRoute`/`leaveToRoute` (external URL →
`safeNavigate`, new tab, `javascript:` refused) or through `route-changed`/`navigate-to-requested`,
which resolve to a same-origin path (`routeTargetUrl` → pathname + search). Redwood: the shell's
`onMateuNavigate` (a path outside the mount is a browser load through the same safe door). RN:
in-app stack navigation only. IntelliJ: in-app routes; browsable links only via `SafeHtml.browse`
(http/https/mailto/tel). Routes are server-authored in every case.

### 8. Live push isolation — no issue

`LiveNotifications.publish(principal, …)` reaches only streams whose caller's AUTHENTICATED name
equals `principal` (Java `IdentityResolver`, .NET `HttpContext.User`, Python the framework identity);
an anonymous stream (name null/blank) receives only `publishToAll`; `publish` refuses a blank
principal. The caller is resolved once per stream (≤ 5 minutes); a sign-out that keeps the tab open
keeps receiving the old user's pushes until the stream ends — acceptable, noted. Several tabs share
one stream per browser (same cookie = same user). Note: the leader/relay keys are per ORIGIN, so two
Mateu apps served from the same origin share the relay (pre-existing for header values).

### 9. Message / result actions — no issue

A toast's or a finished task's `actions[].actionId` is dispatched as an ordinary action on the
initiating component, so strict mode applies, and `IssuedActions.record` harvests ids from the
increment's messages and commands (Progress `resultActions` included) for that caller only. A
session inbox entry (an `inbox` Message) runs its actions the same way, never through
`_notifications-act`. Retry re-runs the action that started the task (same checks).

### 10. Registry bounds / flooding — LOW (accepted, documented)

- The task registry is bounded (10 000, oldest evicted) in all three backends; an entry lives while
  its stream runs. A caller who starts thousands of long tasks evicts OTHER callers' entries: their
  Cancel button then answers nothing (closing the stream still cancels). Limited effect; the app
  bounds what tasks exist. A per-owner cap was not added (anonymous callers share one owner, so it
  would let one anonymous user starve the rest). .NET `Evict` sorts the registry while it is full
  (O(n log n) per new task above the cap) — fine at 10 000.
- The live stream buffers pushes per subscriber without a bound (Java `Flux.create` default buffer,
  .NET `Channel.CreateUnbounded`, Python `asyncio.Queue`); a client that stops reading grows its
  buffer until the 5-minute stream end. Payloads and rates are the app's (`publish` is server-side
  API, not client-driven). No change.
- Cluster: the task registry and `LiveNotifications` are in-process. A cancel must reach the node
  running the task (sticky sessions) and an app must publish on every node (documented in both
  Javadocs).

## Verification

- Java: `mvn -o -pl shared/core -am test -Dtest=CoreLayeringTest,RequestBudgetTest,Notification*,Progress*,ActionsAndCommandsSyncTest,LongTask*` — green.
- .NET: `dotnet test -f net8.0 --filter Notification|ProgressAndNotificationsTests` — green.
- Python: full suite, 1605 passed.
- Web: vitest liveUpdates/notify/progress/bell — 71 passed.
- IntelliJ: `./gradlew test` for ProgressTasksTest, MessageSpecsTest, InboxModelTest, TaskRelayTest,
  MessageGroupsTest, HtmlInDataTest — green.
