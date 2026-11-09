package io.mateu.core.application.notifications;

import io.mateu.uidl.data.AppNotification;
import io.mateu.uidl.interfaces.InboxStore;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Mateu's default {@link InboxStore}: in memory, per process, bounded — {@value #MAX_PER_PRINCIPAL}
 * entries per principal (the newest kept) and {@value #MAX_PRINCIPALS} principals (the least
 * recently used go first). Lost on restart, and not shared between the nodes of a cluster: an app
 * that needs either registers its own {@code InboxStore} bean.
 */
public final class InMemoryInboxStore implements InboxStore {

  static final int MAX_PER_PRINCIPAL = 100;
  static final int MAX_PRINCIPALS = 10_000;

  private final Map<String, LinkedHashMap<String, AppNotification>> inboxes =
      new LinkedHashMap<>(16, 0.75f, true) {
        @Override
        protected boolean removeEldestEntry(
            Map.Entry<String, LinkedHashMap<String, AppNotification>> eldest) {
          return size() > MAX_PRINCIPALS;
        }
      };

  @Override
  public synchronized void add(String principal, AppNotification entry) {
    if (principal == null || entry == null || entry.id() == null) {
      return;
    }
    var inbox = inboxes.computeIfAbsent(principal, p -> new LinkedHashMap<>());
    // the same id replaces the entry, and moves it to the newest end
    inbox.remove(entry.id());
    inbox.put(entry.id(), entry);
    while (inbox.size() > MAX_PER_PRINCIPAL) {
      inbox.remove(inbox.keySet().iterator().next());
    }
  }

  @Override
  public synchronized List<AppNotification> list(String principal) {
    var inbox = principal != null ? inboxes.get(principal) : null;
    if (inbox == null) {
      return List.of();
    }
    var newestFirst = new ArrayList<>(inbox.values());
    java.util.Collections.reverse(newestFirst);
    return newestFirst;
  }

  @Override
  public synchronized void markRead(String principal, List<String> ids) {
    var inbox = principal != null ? inboxes.get(principal) : null;
    if (inbox == null || ids == null) {
      return;
    }
    for (var id : new HashSet<>(ids)) {
      inbox.computeIfPresent(id, (key, n) -> n.unread() ? n.toBuilder().unread(false).build() : n);
    }
  }

  @Override
  public synchronized void dismiss(String principal, List<String> ids) {
    var inbox = principal != null ? inboxes.get(principal) : null;
    if (inbox == null || ids == null) {
      return;
    }
    ids.forEach(inbox::remove);
  }
}
