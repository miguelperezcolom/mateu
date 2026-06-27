---
title: Long-Running Jobs
description: Give a dignified UX to asynchronous processes without freezing the interface.
---

**Status:** ✅ Implemented — `LongTask`, `Flux<?>`, `@Action(background)`

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
| `LongTask` + `Flux<?>` | Operation emits incremental steps; show a live progress dialog |
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

## `LongTask` — live progress dialog

`LongTask` is the high-level API for streaming progress to a modal dialog. Return the result of
`LongTask.run(...)` directly from a `@Button` method:

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

Internally, `LongTask` composes a `Flux.concat` of three segments:

1. **Opening event** — sends a dialog component to the frontend, showing the progress dialog.
2. **Work flux** — your flux, streamed live as each `progress.step(...)` is emitted.
3. **Closing event** — updates the dialog to its final state and dispatches any configured commands.

### `LongTask` builder methods

| Method | Description |
|---|---|
| `LongTask.create(title)` | Opens the dialog with the given header title |
| `.done(doneTitle, doneText)` | Sets the header and body shown when the flux completes |
| `.withProgressBar()` | Adds a determinate progress bar to the dialog |
| `.closeAfter(seconds)` | Auto-closes the dialog N seconds after completion |
| `.withCommand(commands…)` | Dispatches `UICommand`s when the task completes |
| `.run(work)` | Builds the flux; returns this to the `@Button` method |

### Updating progress with `ProgressReporter`

The `work` lambda receives a `ProgressReporter`. Each call to `step(...)` returns the SSE payload
that must be emitted by the flux — it is not a side-effect:

```java
.run(progress -> items
        .map(item -> progress.step("Processing: " + item.name())))
```

`ProgressReporter` offers four overloads:

| Signature | Updates |
|---|---|
| `step(text)` | Dialog body text |
| `step(text, title)` | Dialog body text + header title |
| `step(text, progress)` | Dialog body text + progress bar (0.0 – 1.0) |
| `step(text, title, progress)` | Dialog body text + header title + progress bar |

### Progress bar

Add `.withProgressBar()` to show a determinate progress bar. Pass a `double` between `0.0` and
`1.0` as the progress argument to `step()`. The bar automatically fills to `1.0` when the flux
completes.

```java
@Button
@Action(validationRequired = false)
public Flux<?> importData() {
    return LongTask.create("Importing data...")
            .withProgressBar()
            .done("Done", "Import complete")
            .run(progress -> importService.rows()
                    .map(row -> progress.step(
                            "Imported: " + row.name(),
                            row.index() / (double) row.total())));
}
```

### Auto-closing the dialog

Add `.closeAfter(seconds)` to close the dialog automatically once the task finishes, without
requiring the user to dismiss it manually. Useful for fire-and-forget operations where the final
message is informational:

```java
LongTask.create("Importing data...")
        .withProgressBar()
        .done("Done", "Import complete")
        .closeAfter(3)
        .run(progress -> ...);
```

### Running a command on completion

Add `.withCommand(UICommand...)` to execute one or more UI commands when the task finishes.
Commands run immediately after the dialog is updated to its final state, before any auto-close
timer fires. Multiple commands are supported:

```java
LongTask.create("Importing data...")
        .withProgressBar()
        .done("Done", "Import complete")
        .closeAfter(2)
        .withCommand(UICommand.navigateTo("/results"))
        .run(progress -> ...);
```

Available commands and their behaviour from a dialog element:

| Command | Works | Notes |
|---|---|---|
| `UICommand.navigateTo(url)` | ✅ | Changes `window.location.href`; relative and absolute URLs |
| `UICommand.pushStateToHistory(url)` | ✅ | Pushes a history entry without full reload |
| `UICommand.dispatchEvent(name, detail)` | ✅ | Dispatches a custom DOM event that bubbles up |
| `UICommand.runAction(actionId, targetId)` | ✅ | Triggers an action on a specific component |
| `UICommand.runAction(actionId)` | ⚠️ | Requires the dialog to handle action events; prefer the two-arg form |
| `CloseModal` | ❌ | Use `.closeAfter(seconds)` instead |

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
@Trigger(type = TriggerType.OnLoad, times = 20, timeoutMillis = 3000)
public JobStatus checkStatus() {
    return jobService.getStatus(jobId);
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
