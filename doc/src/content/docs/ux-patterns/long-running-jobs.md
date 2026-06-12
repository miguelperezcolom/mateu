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

  ─────────────────────────────────
  ████████████████░░░░  67%
  Processing 1,234 of 1,841 records…

  [Cancel]
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
