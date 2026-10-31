package io.mateu.core.application.microfrontends;

import io.mateu.uidl.remote.FragmentCacheStore;
import java.time.Clock;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.locks.ReentrantLock;

/** Mateu's own fragment cache: in memory, bounded (least recently used out), entries expire. */
public final class InMemoryFragmentCacheStore implements FragmentCacheStore {

  private record Entry(String value, long expiresAtMillis) {}

  private final int capacity;
  private final Clock clock;
  private final Map<String, Entry> entries;
  // a lock, not a monitor: a virtual thread blocked on a monitor pins its carrier (JDK 21)
  private final ReentrantLock lock = new ReentrantLock();

  public InMemoryFragmentCacheStore() {
    this(1000, Clock.systemUTC());
  }

  public InMemoryFragmentCacheStore(int capacity, Clock clock) {
    this.capacity = capacity;
    this.clock = clock;
    this.entries =
        new LinkedHashMap<>(16, 0.75f, true) {
          @Override
          protected boolean removeEldestEntry(Map.Entry<String, Entry> eldest) {
            return size() > InMemoryFragmentCacheStore.this.capacity;
          }
        };
  }

  @Override
  public String get(String key) {
    lock.lock();
    try {
      var entry = entries.get(key);
      if (entry == null) {
        return null;
      }
      if (entry.expiresAtMillis() <= clock.millis()) {
        entries.remove(key);
        return null;
      }
      return entry.value();
    } finally {
      lock.unlock();
    }
  }

  @Override
  public void put(String key, String value, Duration ttl) {
    if (key == null || value == null || ttl == null || ttl.isZero() || ttl.isNegative()) {
      return;
    }
    lock.lock();
    try {
      entries.put(key, new Entry(value, clock.millis() + ttl.toMillis()));
    } finally {
      lock.unlock();
    }
  }
}
