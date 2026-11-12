package io.mateu.uidl.interfaces;

import io.mateu.uidl.annotations.Experimental;
import io.mateu.uidl.data.PresenceMember;
import java.time.Instant;
import java.util.List;
import java.util.function.BiConsumer;

/**
 * Where record presence ({@code @App(presence = true)}: "Ana is editing this record") is kept.
 *
 * <p>Mateu ships UI only: out of the box an in-memory store is used — per process, bounded, lost on
 * restart — so two users on DIFFERENT nodes of a cluster do not see each other. Register a bean
 * implementing this interface (Redis, a shared cache) to share it; Mateu then calls only these
 * methods. A {@code scope} is one app (its base url and class), a {@code record} one record page
 * within it (its route and view class) — opaque strings Mateu builds; a store never mixes scopes.
 */
@Experimental("record presence (3.0)")
public interface PresenceStore {

  /**
   * Records (or refreshes) one open copy of {@code record}, keyed by its principal + tab. A store
   * may refuse it when one of its bounds is reached: it answers false then.
   */
  boolean touch(String scope, String record, PresenceMember member);

  /** That tab closed the record (or left it). */
  void leave(String scope, String record, String principal, String tab);

  /** The copies of {@code record} last seen after {@code seenAfter}, the oldest first. */
  List<PresenceMember> members(String scope, String record, Instant seenAfter);

  /**
   * Forgets every copy last seen before {@code seenBefore}, telling the {@link #onChange} listeners
   * about the records it changed. Called periodically by Mateu; a store with its own expiry (a TTL)
   * can leave it empty.
   */
  default void expire(Instant seenBefore) {}

  /**
   * Listens to every change ({@code scope}, {@code record}) until the returned handle is closed —
   * what pushes a change to the other sessions at once. A store that cannot tell (the default)
   * still works: the others see the change on their next heartbeat, within 10 seconds.
   */
  default AutoCloseable onChange(BiConsumer<String, String> listener) {
    return () -> {};
  }
}
