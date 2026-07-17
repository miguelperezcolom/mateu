---
title: Notification inbox
description: A bell on the app header with the unread count and a persistent notification list — events, not toasts.
---

**Status:** ✅ Implemented

## Intent

Toasts vanish; work does not. "Your export finished", "an approval is waiting", "the import had 3
errors" must survive the moment they happened and be findable later — with an unread count nudging
the user. This is the **inbox** (events with read state), distinct from
[push toasts](/ux-patterns/notifications/) (transient) and [task queues](/ux-patterns/task-queue/)
(work items).

## Solution

Implement `NotificationsSupplier` on the `@UI` app class:

```java
@UI
public class BackofficeApp implements NotificationsSupplier {

    @Override
    public List<AppNotification> notifications(HttpRequest httpRequest) {
        // per-user inbox: resolve the user from the request (e.g. the Authorization header's
        // Bearer token, the same way @EyesOnly authorization does)
        var user = currentUser(httpRequest.getHeaderValue("Authorization"));
        return notificationStore.latest(user).stream()
            .map(n -> new AppNotification(n.id(), n.title(), n.text(), n.route(),
                                          n.unread(), n.relativeTime()))
            .toList();
    }

    @Override
    public void markNotificationsRead(List<String> ids, HttpRequest httpRequest) {
        notificationStore.markRead(currentUser(httpRequest.getHeaderValue("Authorization")), ids);
    }
}
```

- The shell shows a **bell** on the header (next to the theme toggle) with the **unread count**.
- The bell's panel lists the entries — title, optional text, display time (`when` is already
  formatted by the server: it owns locale and relative-time rules). Clicking an entry with a
  `route` navigates there and marks it read; **Mark all read** clears the count.
- The list is fetched per request through the app-level `_notifications-list` action (the same
  rail as the `@AppContext` pickers' remote search), so it can be per-user and always current;
  `_notifications-read` (ids, or `"all"`) marks read and answers the refreshed list.
- Pair with [long-running jobs](/ux-patterns/long-running-jobs/): when a background task
  completes, append an inbox entry so the outcome survives the toast.

## Wire

`AppDto.notificationsEnabled` turns the bell on; the actions answer
`Data{_notifications: [{id, title, text, route, unread, when}]}` — same contract from the Java,
.NET and Python servers.

## Related

- [Push notifications](/ux-patterns/notifications/) — the transient sibling
- [Task queue](/ux-patterns/task-queue/) — when entries are work items with owners and states
