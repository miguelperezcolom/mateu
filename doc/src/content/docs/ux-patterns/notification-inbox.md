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

:::note[Imports]
The samples leave out their `import` lines and compile with single-type imports. Some names exist
in two Mateu packages (the `@Menu` annotation and the `Menu` record, `@Button` and `Button`…), so
wildcard imports of both packages fail with "reference is ambiguous" — see
[Java imports](/reference/java-imports/).
:::

Implement `NotificationsSupplier` on the `@UI` app class:

```java
@UI("")
public class BackofficeApp implements NotificationsSupplier {

    @Autowired NotificationStore notificationStore;   // your inbox

    @Override
    public List<AppNotification> notifications(HttpRequest httpRequest) {
        // per-user inbox: the user the host framework authenticated (the same identity
        // @EyesOnly authorization uses)
        var user = httpRequest.getUserPrincipal().getName();
        return notificationStore.latest(user).stream()
            .map(n -> new AppNotification(n.id(), n.title(), n.text(), n.route(),
                                          n.unread(), n.relativeTime()))
            .toList();
    }

    @Override
    public void markNotificationsRead(List<String> ids, HttpRequest httpRequest) {
        notificationStore.markRead(httpRequest.getUserPrincipal().getName(), ids);
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
- Pair with [long-running jobs](/ux-patterns/long-running-jobs/): a `LongTask` with
  `.notifyWhenDone()` posts its outcome to the inbox ("Import finished — 3 errors · View").

## Entries you act on 🧪

An entry can be more than a link. Give it a `category` (the panel groups by it), a `variant`
(severity), `actions` the user runs from the entry, and `hasDetail` when clicking it should open a
detail the server builds. States: **unread → read → resolved** (acted upon, still listed under
*Resolved*), or **dismissed** (gone).

```java
AppNotification.builder()
    .id("expense-42")
    .title("Expense to approve")
    .text("Ana · 312,40 €")
    .unread(true)
    .when("5 min ago")
    .category("Approvals")
    .variant(NotificationVariant.warning)
    .actions(List.of(
        MessageAction.run("Approve", "approve").withStyle("primary"),
        MessageAction.run("Reject", "reject").withStyle("danger")))
    .hasDetail(true)
    .build();
```

The supplier's optional methods answer them:

```java
@Override
public Object onNotificationAction(String id, String actionId, HttpRequest httpRequest) {
    expenses.decide(id, actionId);                    // check the id is the caller's!
    inbox.resolve(httpRequest.getUserPrincipal().getName(), id);
    return Message.success("Expense " + actionId + "d");
}

@Override
public void dismissNotifications(List<String> ids, HttpRequest httpRequest) { … }

@Override
public Object notificationDetail(String id, HttpRequest httpRequest) {
    return Drawer.builder().headerTitle("Expense 42").content(expenseView(id)).build();
}
```

They ride the app-level actions `_notifications-act {id, actionId}` (the answer + the refreshed
list), `_notifications-dismiss {ids}` and `_notifications-open {id}` (the detail, answered like any
action — a `Drawer` opens over the page). The panel filters **Unread / All / Resolved**, groups by
category, marks all read and dismisses per entry; all client-side over the list.

## Pushed, not polled 🧪

With `@App(liveUpdates = true)` the bell updates as soon as something changes. Store the entry,
then publish it:

```java
inbox.add(user, entry);
LiveNotifications.publish(user, entry);      // only the sessions of `user`
LiveNotifications.publishToAll(announcement); // everyone
LiveNotifications.remove(user, "expense-42");
LiveNotifications.refresh(user);              // "fetch the list again"
```

A change reaches only the sessions whose caller — the identity the host framework authenticated —
has that name. It travels as a `NotificationsChanged` command on the app's live-updates stream; a
new unread entry also shows a toast. The same `id` replaces an entry (deduplication). In-process:
in a cluster, publish on every node.

The inbox a user sees is your list plus what this session added on its own — messages sent with
persistence `inbox` and pushed entries the list does not have yet — deduplicated by id. Durable
entries are yours: Mateu ships UI only.

## In YAML

A data-authored shell feeds the bell from REST sources instead of a `NotificationsSupplier` class:
`notifications: {source: …, markRead: …}` on its `type: AppShell` — fetched by the browser (or
through the server when the source is `proxy: true`). See
[App shell as data › Header extras](/define/yaml/app-shell/#header-extras-pickers-actions-inbox-and-search).

## Wire

`AppDto.notificationsEnabled` turns the bell on; the actions answer
`Data{_notifications: [{id, title, text, route, unread, when, category, variant, resolved,
actions, hasDetail}]}` — same contract from the Java, .NET and Python servers. A push is the command
`NotificationsChanged {notification, removedId}` (both null = refetch).

On **IntelliJ / the desktop app** the entries are the platform's own notifications ("Mateu" group,
the Notifications tool window), with their actions; on the **phone** the bell lists them with the
same filters. Operating-system notifications (Web Notifications, phone push) are planned for 3.1.

## Where it works

Every renderer. On **Redwood** the bell sits in the global header (badge with the unread count) and
opens an `oj-popup` holding JET's `oj-list-view`; activating an entry marks it read and navigates to
its route. Demo: `demo-vb-pms` (`PmsHome` implements `NotificationsSupplier`). A data-authored
shell's `notifications.source` works there too: the same bell lists it (a proxied source through
`_appsource`), and opening an entry or *Mark all read* calls `markRead`.

## Related

- [Push notifications](/ux-patterns/notifications/) — the transient sibling
- [Task queue](/ux-patterns/task-queue/) — when entries are work items with owners and states
