---
title: Long-Running Jobs
description: Give a dignified UX to asynchronous processes without freezing the interface.
---

**Status:** ✅ Implemented — `LongTask` (a task in the user's task center), `Flux<?>`, `@Action(background)`

## Intent

Give asynchronous processes a dignified UX without freezing the interface.

## Problem

A process that takes seconds or minutes and blocks the entire screen is the *Spinner Prison*: the
user cannot do anything and does not know if the system is still alive. Long operations must be
launched, tracked, and reacted to without a hard block.

## Solution

Mateu offers three strategies depending on how much feedback the operation can provide:

| Strategy | When to use |
|---|---|
| `LongTask` + `Flux<?>` | Operation emits incremental steps; it is a task the user follows (blocking or in the background), can cancel and retry |
| `Flux<?>` (low-level) | Need full control over what is streamed to the client |
| `@Action(background = true)` | Fire-and-forget; the UI stays interactive, no progress shown |

### How streaming is wired: `Flux` ⇔ `sse`

Returning a `Flux<?>` **is** the switch that turns on SSE streaming: the framework
detects the `Flux` return type and enables `sse` automatically, so you rarely write
`@Action(sse = true)` by hand (`LongTask.run(...)` returns a `Flux`, so it streams too).
Under the hood every action produces a `Flux<UIIncrementDto>` — a non-streaming action
emits a single item, a streaming one emits many over the same SSE channel.

`background` is a **separate, orthogonal** flag: it only tells the frontend not to show
the busy indicator (a fire-and-forget feel). It does not stream and is not needed for
streaming. The two concerns are independent:

| Concern | Control |
|---|---|
| Stream many updates vs one response | return a `Flux<?>` (auto-enables `sse`) — or `@Action(sse = true)` |
| Show the busy indicator vs fire-and-forget | `@Action(background = …)` |

---

## `LongTask` — a task the user can follow

:::note[Imports]
The samples leave out their `import` lines and compile with single-type imports. Some names exist
in two Mateu packages (the `@Menu` annotation and the `Menu` record, `@Button` and `Button`…), so
wildcard imports of both packages fail with "reference is ambiguous" — see
[Java imports](/reference/java-imports/).
:::

`LongTask` is the high-level API for long work. It does not draw anything: it reports a **task** —
its title, what it is doing, how far it got, whether it is done, failed or cancelled — and each
renderer presents it the way its platform does:

| Renderer | Blocking task | Background task |
|---|---|---|
| Web (Vaadin) | a modal progress with Cancel / Background | the task center: an indicator with the number of running tasks, opening the list |
| Redwood | an `oj-dialog` with `oj-progress-bar` | a docked task panel |
| Phone app | a modal with a progress bar | a strip ("3 tasks running") opening a sheet |
| IntelliJ / desktop | the IDE's background tasks, and an overlay with progress and Cancel (and *Move to background*) over the Mateu view that started it — that view only; never a modal window | the IDE's background tasks (status bar, Background Tasks window) |

Several tasks can run at once, and a task keeps running — and stays in the task center — when the
user leaves the screen. Return the result of `LongTask.run(...)` from a `@Button` method:

```java
@Button
@Action(validationRequired = false)
public Flux<?> generateReport() {
    return LongTask.create("Generating report...")
            .done("Done", "Report generated")
            .run(progress -> reportService.generateWithProgress()
                    .map(step -> progress.step(step.message())));
}
```

The stream is the task's start (running, "Starting..." — translated by your `Translator`), one
update per `progress.step(...)`, and its end (done, with the `done` texts and result actions, then
the `withCommand` commands). If the work fails the task ends **failed** with the message the user
sees (the error boundary's: your `UserFacingException` text, or the generic one with a reference);
if it is cancelled it ends **cancelled**. On the wire every update is a `Progress` command carrying
the whole state of the task (`taskId`, `title`, `text`, `fraction` — null when indeterminate —,
`done`/`total`, `state`, `blocking`, `cancellable`…).

### `LongTask` builder methods

| Method | Description |
|---|---|
| `LongTask.create(title)` | The task's title |
| `.done(doneTitle, doneText)` | The title and text shown once the work completes |
| `.withProgressBar()` | Determinate: `step(text, fraction)` moves it; it fills when done |
| `.closeAfter(seconds)` | A finished blocking task's surface closes N seconds after completion |
| `.withCommand(commands…)` | `UICommand`s run when the task completes |
| `.startingText(text)` | The status shown until the first step |
| `.background()` 🧪 | A background task: the user keeps working (default: blocking) |
| `.backgroundable()` 🧪 | Blocking, but the user may move it to the background |
| `.cancellable()` / `.onCancel(hook)` 🧪 | The user may cancel it; the hook runs on cancel |
| `.retryable()` 🧪 | A failed run offers Retry (the same action again) |
| `.resultAction(MessageAction)` 🧪 | "Open report", "View errors" on the finished task |
| `.notifyWhenDone()` 🧪 | The finished task also lands in the [notification inbox](/ux-patterns/notification-inbox/) |
| `.run(work)` | Builds the flux; return it from the `@Button` method |

🧪 = `@Experimental` (3.0).

### Updating progress with `ProgressReporter`

The `work` lambda receives a `ProgressReporter`. Each call to `step(...)` returns the update that
must be emitted by the flux — it is not a side-effect:

```java
LongTask.create("Processing...")
        .run(progress -> items
                .map(item -> progress.step("Processing: " + item.name())));
```

| Signature | Updates |
|---|---|
| `step(text)` | The status text |
| `step(text, title)` | The status text + the title |
| `step(text, fraction)` | The status text + the fraction (0.0 – 1.0, with `withProgressBar()`) |
| `step(text, title, fraction)` | All three |
| `step(text, done, total)` 🧪 | The status text + a count ("12 of 300"); makes the task determinate |

A count is the most honest progress there is: prefer it when the work is countable.

A determinate task (a count or a fraction) also gets an ESTIMATE of the time left 🧪 — "about 2
min left" — once it is honest: the server watches the rate the task advances (smoothed, so one
fast row does not make a promise) and only says something after it has advanced twice and run for
two seconds. An indeterminate task never gets one, and neither does a finished one. The estimate
travels as `etaSeconds` on the progress; every renderer words it in the user's language.

### A background task the user can cancel

```java
@Button
public Flux<?> importAll() {
    return LongTask.create("Importing customers")
            .background()
            .cancellable()
            .onCancel(importService::rollBack)
            .retryable()
            .done("Import finished", "All customers imported")
            .resultAction(MessageAction.open("Open report", "/imports/latest"))
            .notifyWhenDone()
            .run(progress -> importService.rows()
                    .map(row -> progress.step("Imported " + row.name(), row.index(), row.total())));
}
```

Cancel sends the reserved action `_progress-cancel` with the task id: the server stops the work
flux (Reactor cancels it — write the work so that a cancel stops it), runs `onCancel` and ends the
task cancelled. Only the caller who started a task can cancel it (an anonymous caller's task is
cancellable by whoever holds its random id). In a cluster the cancel must reach the node running
the task (sticky sessions).

### Auto-closing and commands on completion

```java
LongTask.create("Importing data...")
        .withProgressBar()
        .done("Done", "Import complete")
        .closeAfter(2)
        .withCommand(UICommand.navigateTo("/results"))
        .run(progress -> importService.rows()
                .map(row -> progress.step("Imported: " + row.name())));
```

The commands run after the task is reported done, on the screen that started it.

### A task survives a reload 🧪

Reloading the page, navigating away or losing the connection does not stop a task. Each renderer
remembers, for the session, the tasks its streams reported (a browser tab keeps them in its session
storage; the desktop app keeps them on disk for an hour, per backend, so they also survive
closing and reopening the IDE); when it comes back it asks the server which are still there (`_progress-tasks`) and
follows each one again (`_progress-resume`): the task center fills up again and the task ends there
as usual. A task that finished in the meantime still says how it ended.

The server keeps a task with nobody following it for a GRACE PERIOD — 60 seconds by default — and
then cancels it (`onCancel` runs): closing the tab for good still stops the work, just not
instantly.

```properties
# seconds; 0 = closing the stream cancels the task at once (the behaviour before 3.0-rc)
mateu.progress.reattach-grace-seconds=60
```

.NET: `MateuOptions.ProgressReattachGraceSeconds`; Python: `add_mateu(progress_reattach_grace_seconds=60)`;
all three read `MATEU_PROGRESS_REATTACH_GRACE_SECONDS`.

After a reload the task no longer has the screen that started it, so only what makes sense without
it is offered: its progress, its messages, its result actions that open a ROUTE. Retry, result
actions that run an `actionId` and the `withCommand` commands are for the screen that started the
task. Reattaching follows the cancel rules: only the caller who started a task can see or follow it
again — anyone else gets exactly what an unknown task id gets, nothing. In a cluster the reload must
reach the node running the task (sticky sessions).

### Tell the user's device when it is done 🧪

With `@App(osNotifications = true)` a background task that finishes while the app is not in front
also shows as a notification of the operating system — see
[Notification inbox](/ux-patterns/notification-inbox/#operating-system-notifications).

On a **phone** that is narrower than it sounds. The notification is local: the app itself has to be
running to post it, and the OS suspends a backgrounded app soon after you leave it (within seconds on
iOS). So you get one if the task ends during that short window, and not if it ends later or the app
was closed. There is no remote push in 3.0, by design.

Two things soften it when the user comes back: the task center reattaches to a task that is still
running, and the bell fetches its list again at once, so a `notifyWhenDone()` entry stored for a
signed-in user is there. Mind the server's reattach grace period above: a task whose stream was cut
by the suspension is **cancelled** when the grace period runs out with nobody back. For work that
outlasts it, raise `mateu.progress.reattach-grace-seconds` or run the job independently of the stream
and publish its result to the inbox yourself.

### Validation

If the action reads form fields, validation runs before the method is called by default. Add
`@Action(validationRequired = false)` to skip it — common for operations that don't depend on
the current form values:

```java
@Button
@Action(validationRequired = false)
public Flux<?> doSomethingLong() { ... }
```

---

## Low-level `Flux<?>` streaming

When you need full control over what is streamed, return a `Flux<?>` directly and emit any
supported UI effect type. The framework maps each emitted value to an SSE event and sends it to
the client:

```java
@Button
public Flux<?> streamResults() {
    return service.processItems()
            .map(item -> Message.info("Processed: " + item.name()))
            .concatWith(Flux.just(Message.success("All done")));
}
```

Supported emit types include `Message`, `UICommand`, `UIFragmentDto`, `UIIncrementDto`, and any
object that the reflection mapper can convert to a component.

---

## Non-blocking launch

Set `background = true` to start the job and return immediately. The UI stays interactive; no
progress dialog is shown. Use this for operations where the outcome is reported separately (e.g.
via email, a refresh, or polling).

```java
@Button
@Action(background = true)
public void generateReport() {
    reportService.generate();
}
```

---

## Polling with `@Trigger`

When push is not available, use `@Trigger` to poll for state at regular intervals:

```java
@Trigger(type = TriggerType.OnLoad, actionId = "checkStatus", times = 20, timeoutMillis = 3000)
public class ReportStatus {

    @Hidden String jobId;
    @Autowired JobService jobService;

    public JobStatus checkStatus() {
        return jobService.getStatus(jobId);
    }
}
```

---

## Structure

Progress dialog while running:

```
  ┌──────────────────────────────────────┐
  │ Generating report...              ✕  │
  ├──────────────────────────────────────┤
  │ Processing record 1,234 of 1,841     │
  │ ████████████████░░░░░░░░░░  67%     │
  └──────────────────────────────────────┘
```

Dialog after completion (with `.done()`):

```
  ┌──────────────────────────────────────┐
  │ Done                              ✕  │
  ├──────────────────────────────────────┤
  │ Report generated                     │
  │ ██████████████████████████  100%    │
  └──────────────────────────────────────┘
```

---

## Principles served

- **Preserve context** — the rest of the UI stays usable while the job runs
- **Feedback** — the user sees live progress rather than a frozen screen
- **Recoverability** — the user can close the dialog; errors surface as actionable feedback
- **Consistency** — progress and outcome feedback follow the same pattern everywhere

**See it live in the Explorer:** [Notification inbox & background work](https://explorer.mateu.io/behaviour/app/inbox-and-tasks) · [Long tasks (streamed progress)](https://explorer.mateu.io/behaviour/actions/long-tasks)
