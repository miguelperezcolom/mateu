---
title: "Case study: SSR to SSG control plane"
weight: 1
---

# Case study: SSR to SSG control plane

This case study shows Mateu used in a distributed content publishing system. It illustrates several real-world patterns that appear in large deployments.

---

## System overview

The system publishes content from a CMS to a static site generator (SSG). The control plane is a Mateu backoffice that manages and monitors the pipeline.

```
Content editors → Mateu control plane → Content service → SSG pipeline → Static servers
```

Components:

| Service | Role |
|---|---|
| **control-plane** | Admin UI (Mateu) — monitors the pipeline, triggers deployments |
| **content-service** | Stores and serves structured content |
| **ssg-worker** | Converts content to static HTML |
| **static-server** | Serves the generated HTML |
| **shell** | Aggregates the UIs of all services into one backoffice |

---

## Service-owned UIs

Each service exposes its own Mateu UI:

```java
// In the content-service
@UI("/_content")
public class ContentServiceUI {
    @Menu PagesOrchestrator pages;
    @Menu TemplatesOrchestrator templates;
}

// In the ssg-worker service
@UI("/_ssg")
public class SsgServiceUI {
    @Menu JobsPage jobs;
    @Menu DeploymentsPage deployments;
}
```

The shell aggregates them:

```java
@UI("")
public class ControlPlane {
    @Menu RemoteMenu content = new RemoteMenu("Content", "https://content-service/_content");
    @Menu RemoteMenu ssg     = new RemoteMenu("Publishing", "https://ssg-worker/_ssg");
}
```

See [Service-owned UI modules](/java-user-manual/real-world/service-owned-ui-modules/) for the full pattern.

---

## Query services and UI rows

The jobs listing shows publishing jobs as UI rows with per-row actions:

```java
record JobRow(
        String id,
        String page,
        LocalDateTime startedAt,
        Duration duration,
        Status status,
        ColumnActionGroup actions
) {}

// In search():
new JobRow(
        dto.id(),
        dto.pagePath(),
        dto.startedAt(),
        dto.duration(),
        new Status(mapStatus(dto.status()), dto.status().name()),
        dto.status() == RUNNING
                ? new ColumnActionGroup(new ColumnAction[]{ new ColumnAction("cancel", "Cancel", IconKey.Close.iconName) })
                : new ColumnActionGroup(new ColumnAction[]{ new ColumnAction("retry", "Retry", IconKey.Refresh.iconName) })
)
```

See [Query services and UI rows](/java-user-manual/real-world/query-services-and-ui-rows/).

---

## Long-running operations with SSE

Triggering a full site rebuild takes time. SSE streams progress back to the browser:

```java
Action.builder()
        .id("rebuild-all")
        .sse(true)
        .confirmationRequired(true)
        .confirmationTexts(new ConfirmationTexts(
                "Rebuild entire site",
                "This will re-generate all pages. Continue?",
                "Yes, rebuild",
                "Cancel"
        ))
        .build()

@Override
public Object handleAction(String actionId, HttpRequest httpRequest) {
    return ssgWorker.rebuildAll()   // returns Flux<BuildProgressEvent>
            .map(event -> new State(Map.of(
                    "currentPage", event.pagePath(),
                    "pagesProcessed", event.count(),
                    "total", event.total()
            )));
}
```

---

## Stateless backend

Each Mateu page class is stateless — no mutable fields survive between requests. State lives either in:
- The JWT (user identity, permissions)
- The database (content, job status)
- The browser (form state, via `state` and `data` contexts)

This allows horizontal scaling with no sticky sessions.

---

## Key patterns used

| Pattern | Where documented |
|---|---|
| Service-owned UI modules | [Real-world: service-owned modules](/java-user-manual/real-world/service-owned-ui-modules/) |
| Query services and UI rows | [Real-world: query services](/java-user-manual/real-world/query-services-and-ui-rows/) |
| `RemoteMenu` aggregation | [Navigation and menus](/java-user-manual/build/navigation-and-menus/) |
| SSE for long operations | [Actions: SSE](/java-user-manual/concepts/fluent-components/fluent-actions/) |
| JWT-based authorization | [Security](/java-user-manual/advanced/security/) |
| `@EyesOnly` per role | [Security](/java-user-manual/advanced/security/) |

---

## Next

- [Distributed control plane](/java-user-manual/real-world/distributed-control-plane/)
- [Service-owned UI modules](/java-user-manual/real-world/service-owned-ui-modules/)
