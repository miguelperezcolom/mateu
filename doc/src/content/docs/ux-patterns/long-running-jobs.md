---
title: Long-Running Jobs
description: Give a dignified UX to asynchronous processes without freezing the interface.
---

**Status:** ✅ Implemented — `@Action(background, sse)`, `@Trigger`

## Intent

Give asynchronous processes a dignified UX without freezing the interface.

## Problem

A process that takes seconds or minutes and blocks the entire screen is the *Spinner Prison*: the user cannot do anything and does not know if the system is still alive. Long operations must be launched, tracked, and reacted to without a hard block.

## Solution

### Non-blocking launch

Set `background = true` on the action. The server starts the job and returns immediately; the UI remains interactive.

```java
@Action(background = true, sse = true)
public void generateReport() {
    // runs asynchronously; progress is streamed back
    reportService.generate();
}
```

### Live progress via SSE

With `sse = true`, the server can push progress events back to the client. Use a `ProgressBar` or a `@Status` field to reflect the current state.

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
