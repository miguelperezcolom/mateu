package io.mateu.core.application.push;

import io.mateu.uidl.interfaces.PushTokenStore;
import io.mateu.uidl.push.PushToken;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * Mateu's default {@link PushTokenStore}: in memory, per process, bounded — {@value
 * #MAX_PER_PRINCIPAL} tokens per principal (the newest kept) and {@value #MAX_PRINCIPALS}
 * principals (the least recently used go first). LOST ON RESTART and not shared between the nodes
 * of a cluster: a phone receives nothing after a restart until it registers again. An app that
 * needs more registers its own {@code PushTokenStore} bean.
 */
public final class InMemoryPushTokenStore implements PushTokenStore {

  static final int MAX_PER_PRINCIPAL = 10;
  static final int MAX_PRINCIPALS = 10_000;

  private final Map<String, List<PushToken>> tokens =
      new LinkedHashMap<>(16, 0.75f, true) {
        @Override
        protected boolean removeEldestEntry(Map.Entry<String, List<PushToken>> eldest) {
          return size() > MAX_PRINCIPALS;
        }
      };

  @Override
  public synchronized void register(String principal, PushToken token) {
    if (principal == null || token == null || token.token() == null) {
      return;
    }
    // the same token, or the same device: a phone has one registration at a time
    removeWhere(t -> sameDevice(t, token));
    var list = tokens.computeIfAbsent(principal, p -> new ArrayList<>());
    list.add(token);
    while (list.size() > MAX_PER_PRINCIPAL) {
      list.remove(0);
    }
  }

  @Override
  public synchronized void unregister(String token) {
    if (token != null) {
      removeWhere(t -> token.equals(t.token()));
    }
  }

  @Override
  public synchronized List<PushToken> tokensFor(String principal) {
    var list = principal != null ? tokens.get(principal) : null;
    return list == null ? List.of() : List.copyOf(list);
  }

  private static boolean sameDevice(PushToken a, PushToken b) {
    if (a.token().equals(b.token())) {
      return true;
    }
    return a.deviceId() != null
        && a.deviceId().equals(b.deviceId())
        && Objects.equals(a.ui(), b.ui());
  }

  private void removeWhere(java.util.function.Predicate<PushToken> match) {
    var emptied = new ArrayList<String>();
    for (var entry : tokens.entrySet()) {
      entry.getValue().removeIf(match);
      if (entry.getValue().isEmpty()) {
        emptied.add(entry.getKey());
      }
    }
    emptied.forEach(tokens::remove);
  }
}
