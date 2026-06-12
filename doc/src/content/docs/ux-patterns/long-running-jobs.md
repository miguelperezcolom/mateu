---
title: Long-Running Jobs
description: Give a dignified UX to asynchronous processes without freezing the interface.
---

**Status:** ✅ Implemented — `LongTask`, `Flux<?>`, `@Action(background)`

## Intent

Give asynchronous processes a dignified UX without freezing the interface.

## Problem

A process that takes seconds or minutes and blocks the entire screen is the *Spinner Prison*: the user cannot do anything and does not know if the system is still alive. Long operations must be launched, tracked, and reacted to without a hard block.

## Solution

### Live progress via SSE

Return a `Flux<?>` from a `@Button` method. Mateu automatically streams the emitted values to the client via SSE — no extra annotation needed.

Use `LongTask` to open a progress dialog without dealing with SSE internals:

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

`LongTask.create(title)` opens a progress dialog. Each call to `progress.step(text)` updates the dialog text. The optional `.done(title, text)` call sets the final state when the flux completes.

To also update the dialog title during progress, use `progress.step(text, title)`.

#### With a progress bar

Add `.withProgressBar()` to show a determinate progress bar inside the dialog. Pass a `double` between `0.0` and `1.0` as the second argument to `step()`:

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

You can also update the dialog title at the same time: `progress.step(text, title, progress)`.

When the flux completes, the bar automatically fills to 1.0.

If the action reads form fields, validation runs before the method is called by default. Add `@Action(validationRequired = false)` to skip it.

### Non-blocking launch

Set `background = true` on the action. The server starts the job and returns immediately; the UI remains interactive.

```java
@Button
@Action(background = true)
public void generateReport() {
    reportService.generate();
}
```

### Live progress via SSE (low-level)

When you need full control over what gets streamed, return a `Flux<?>` directly and emit any supported UI effect type. The framework streams each emitted value to the client as an SSE event.

### Polling with `@Trigger`

When push is not available, use `@Trigger` to poll for state:

```java
@Trigger(type = TriggerType.OnLoad, times = 20, timeoutMillis = 3000)
public JobStatus checkStatus() {
    return jobService.getStatus(jobId);
}
```

### Reacting to outcome

```java
@Trigger(type = TriggerType.OnSuccess)
public View onJobSuccess() { ... }

@Trigger(type = TriggerType.OnError)
public View onJobError() { ... }
```

## Structure

```
Generate report

  [Start report]

  ┌─────────────────────────────────────┐
  │ Generating report...                │
  │                                     │
  │ Processing record 1,234 of 1,841    │
  │ ████████████████░░░░░░░░░░░  67%   │
  └─────────────────────────────────────┘
```

After completion:

```
  ✓ Report ready — 1,841 records processed in 4.2 s
  [Download]  [View online]
```

## Principles served

- **Recoverability** — the user can cancel; errors surface as actionable feedback
- **Preserve context** — the rest of the UI stays usable while the job runs
- **Consistency** — progress and outcome feedback follow the same pattern everywhere
