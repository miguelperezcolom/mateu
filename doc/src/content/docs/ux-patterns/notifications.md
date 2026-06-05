---
title: Push Notifications (polling)
description: Show live alerts and pending-task counts without a WebSocket, using trigger-based self-scheduling polls.
---

**Status:** ✅ Implemented — `@Trigger(OnLoad + OnSuccess)`, `Hydratable`, `MicroFrontend`

## Intent

Surface live information — pending tasks, system alerts, unread messages — to the user without requiring a persistent connection, and without blocking the rest of the UI.

## Problem

Enterprise apps often need to notify users of asynchronous events (a workflow task assigned, an import that finished, an approval waiting). WebSockets add infrastructure complexity; SSE is fire-and-forget. A simpler approach covers most cases: a lightweight component that polls the backend on a fixed interval and updates its own display.

## Solution

Combine two triggers on a component to create a self-scheduling poll loop:

1. `@Trigger(type = OnLoad, actionId = "X", timeoutMillis = N)` — fires action `X` N ms after the component loads.
2. `@Trigger(type = OnSuccess, actionId = "X", calledActionId = "X", timeoutMillis = N)` — fires action `X` again N ms after each successful completion of `X`.

The action returns `new State(this)`, which pushes the updated component state to the frontend. `Hydratable.hydrate()` runs before each render to refresh data from the backend.

---

## Structure

```
Shell header
  └── MicroFrontend (/_forms/my-tasks)
        └── TasksWidget
              @Trigger OnLoad  ──────────────────────────────────┐
              @Trigger OnSuccess (calledActionId = refreshTasks)  │
                    ↓ (after 5 s)                                 │
              refreshTasks() → State(this)                        │
              hydrate()  ← reads DB / service                     │
              component() ← renders updated content               │
                    └──────────────────────────────────────────────┘
```

---

## Implementation

### 1. The notification widget

```java
@UI(value = "/_forms/my-tasks")
@Title("")
@Service
@RequiredArgsConstructor
@Trigger(type = TriggerType.OnLoad,    actionId = "refreshTasks", timeoutMillis = 5000)
@Trigger(type = TriggerType.OnSuccess, actionId = "refreshTasks",
         calledActionId = "refreshTasks", timeoutMillis = 5000)
@Action(id = "refreshTasks")
public class TasksWidget implements Hydratable, ComponentTreeSupplier {

    final TaskRepository repository;
    String content;

    // Called before rendering — refresh data from the backend
    @Override
    public void hydrate(HttpRequest httpRequest) {
        long pending = repository.countPendingFor(
                JwtExtractor.getUsername(httpRequest).orElse(""));

        if (pending > 0) {
            content = "<a href=\"#\" onclick=\"" + navScript() + "\" "
                    + "style=\"animation: fade 2s ease-in-out infinite alternate;\">"
                    + "You have " + pending + " task(s)!"
                    + "</a>"
                    + "<style>@keyframes fade{from{opacity:1}to{opacity:0}}</style>";
        } else {
            content = "<a href=\"#\" onclick=\"" + navScript() + "\">No pending tasks</a>";
        }
    }

    // Returns updated state to the frontend — triggers re-render
    Object refreshTasks() {
        return new State(this);
    }

    @Override
    public Component component(HttpRequest httpRequest) {
        return Text.builder().text("${state.content}").build();
    }

    private String navScript() {
        return "event.preventDefault(); this.dispatchEvent(new CustomEvent("
                + "'navigation-requested',{detail:{"
                + "route:'/forms/tasks',consumedRoute:'',"
                + "baseUrl:'/_forms',serverSideType:'io.example.FormsHome'"
                + "},bubbles:true,composed:true}))";
    }
}
```

### 2. Embedding the widget in the shell

Embed the widget as a `MicroFrontend` inside the shell's `widgets()`. The widget lives in a separate service — the shell just points to its URL.

```java
@UI("")
public class ShellHome implements WidgetSupplier {

    @Override
    public List<Component> widgets(HttpRequest httpRequest) {
        return List.of(
            HorizontalLayout.builder()
                .content(List.of(
                    MicroFrontend.builder()
                        .baseUrl("/_forms")
                        .route("/my-tasks")
                        .build(),
                    // ... other header widgets (user menu, etc.)
                ))
                .style("align-items: flex-end;")
                .build()
        );
    }
}
```

---

## How the poll loop works

| Step | What happens |
|---|---|
| Page loads | `OnLoad` trigger fires after `timeoutMillis` ms |
| `refreshTasks()` runs | `hydrate()` reads the DB; action returns `State(this)` |
| Frontend receives new state | Component re-renders with updated content |
| `OnSuccess` trigger fires | After `timeoutMillis` ms, calls `refreshTasks()` again |
| Loop continues indefinitely | Until the user navigates away or the component is unmounted |

The interval is set independently on each trigger, so you can load immediately but poll less frequently:

```java
@Trigger(type = TriggerType.OnLoad,    actionId = "poll", timeoutMillis = 0)     // immediate
@Trigger(type = TriggerType.OnSuccess, actionId = "poll",
         calledActionId = "poll",      timeoutMillis = 10_000)  // every 10 s
```

---

## Key interfaces and types

| Type | Role |
|---|---|
| `Hydratable` | `hydrate(HttpRequest)` is called before each render — use it to populate fields from the backend |
| `State(this)` | Return value from an action — pushes the component's current field values to the frontend |
| `MicroFrontend` | Embeds a remote `@UI` component inside the host shell |
| `WidgetSupplier` | Interface on the shell class that injects components into the header widget area |

---

## Variants

- **Badge count** — render an integer and style it as a pill badge.
- **System alert banner** — render a full-width coloured banner when a critical condition is detected.
- **Cross-service** — the widget `@UI` lives in a different microservice from the shell; the shell embeds it via `MicroFrontend` pointing to that service's base URL.
- **Auth-aware** — read the JWT from `HttpRequest` in `hydrate()` to filter tasks by the current user (see example above with `JwtExtractor`).

---

## Principles served

- **Preserve context** — notifications appear in-place; the user is not redirected
- **Progressive complexity** — the widget is invisible when there is nothing to report
- **Workflow over screens** — one click takes the user directly to the pending-tasks screen
