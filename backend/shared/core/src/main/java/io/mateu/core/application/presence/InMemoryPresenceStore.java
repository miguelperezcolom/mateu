package io.mateu.core.application.presence;

import io.mateu.uidl.data.PresenceMember;
import io.mateu.uidl.interfaces.PresenceStore;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.function.BiConsumer;

/**
 * Mateu's default {@link PresenceStore}: in memory, per process, bounded — {@value #MAX_RECORDS}
 * open records, {@value #MAX_MEMBERS_PER_RECORD} copies per record and {@value
 * #MAX_COPIES_PER_PRINCIPAL} copies per principal (a touch beyond a bound is refused, nothing is
 * evicted: presence that disappears silently would be worse than presence that is never shown). Not
 * shared between the nodes of a cluster: an app that needs it registers its own store.
 */
public final class InMemoryPresenceStore implements PresenceStore {

  static final int MAX_RECORDS = 10_000;
  static final int MAX_MEMBERS_PER_RECORD = 50;
  static final int MAX_COPIES_PER_PRINCIPAL = 50;

  /** scope + record → (principal + tab → member). */
  private final Map<String, LinkedHashMap<String, PresenceMember>> records = new HashMap<>();

  private final Map<String, Integer> copiesByPrincipal = new HashMap<>();
  private final List<BiConsumer<String, String>> listeners = new CopyOnWriteArrayList<>();

  private static String recordKey(String scope, String record) {
    return scope + "\u0000" + record;
  }

  private static String memberKey(String principal, String tab) {
    return principal + "\u0000" + (tab != null ? tab : "");
  }

  @Override
  public boolean touch(String scope, String record, PresenceMember member) {
    if (scope == null || record == null || member == null || member.principal() == null) {
      return false;
    }
    boolean changed;
    synchronized (this) {
      var key = recordKey(scope, record);
      var members = records.get(key);
      var memberKey = memberKey(member.principal(), member.tab());
      var previous = members != null ? members.get(memberKey) : null;
      if (previous == null) {
        if (members == null && records.size() >= MAX_RECORDS) return false;
        if (members != null && members.size() >= MAX_MEMBERS_PER_RECORD) return false;
        if (copiesByPrincipal.getOrDefault(member.principal(), 0) >= MAX_COPIES_PER_PRINCIPAL) {
          return false;
        }
        if (members == null) {
          members = new LinkedHashMap<>();
          records.put(key, members);
        }
        copiesByPrincipal.merge(member.principal(), 1, Integer::sum);
      }
      var kept =
          previous != null && previous.since() != null
              ? member.toBuilder().since(previous.since()).build()
              : member;
      members.put(memberKey, kept);
      changed =
          previous == null
              || previous.editing() != member.editing()
              || !java.util.Objects.equals(previous.name(), member.name());
    }
    if (changed) notify(scope, record);
    return true;
  }

  @Override
  public void leave(String scope, String record, String principal, String tab) {
    if (scope == null || record == null || principal == null) return;
    boolean removed;
    synchronized (this) {
      var key = recordKey(scope, record);
      var members = records.get(key);
      removed = members != null && members.remove(memberKey(principal, tab)) != null;
      if (removed) {
        release(principal);
        if (members.isEmpty()) records.remove(key);
      }
    }
    if (removed) notify(scope, record);
  }

  @Override
  public synchronized List<PresenceMember> members(String scope, String record, Instant seenAfter) {
    var members = records.get(recordKey(scope, record));
    if (members == null) return List.of();
    var result = new ArrayList<PresenceMember>();
    for (var member : members.values()) {
      if (seenAfter == null || member.lastSeen() == null || member.lastSeen().isAfter(seenAfter)) {
        result.add(member);
      }
    }
    result.sort(
        Comparator.comparing(
            PresenceMember::since, Comparator.nullsLast(Comparator.naturalOrder())));
    return result;
  }

  @Override
  public void expire(Instant seenBefore) {
    var changed = new ArrayList<String[]>();
    synchronized (this) {
      var it = records.entrySet().iterator();
      while (it.hasNext()) {
        var entry = it.next();
        boolean removedAny =
            entry
                .getValue()
                .values()
                .removeIf(
                    m -> {
                      boolean stale = m.lastSeen() != null && m.lastSeen().isBefore(seenBefore);
                      if (stale) release(m.principal());
                      return stale;
                    });
        if (removedAny) {
          changed.add(entry.getKey().split("\u0000", 2));
        }
        if (entry.getValue().isEmpty()) it.remove();
      }
    }
    for (var key : changed) notify(key[0], key[1]);
  }

  @Override
  public AutoCloseable onChange(BiConsumer<String, String> listener) {
    listeners.add(listener);
    return () -> listeners.remove(listener);
  }

  /** How many records have someone on them (tests). */
  synchronized int size() {
    return records.size();
  }

  private void release(String principal) {
    copiesByPrincipal.computeIfPresent(principal, (p, n) -> n <= 1 ? null : n - 1);
  }

  private void notify(String scope, String record) {
    for (var listener : listeners) {
      try {
        listener.accept(scope, record);
      } catch (RuntimeException ignored) {
        // one broken stream must not stop the others
      }
    }
  }
}
