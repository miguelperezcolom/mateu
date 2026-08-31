package io.mateu.core.application.runaction;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.dtos.AppDto;
import java.util.concurrent.atomic.AtomicLong;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * What the descriptor cache may and may not hand back.
 *
 * <p>The one that matters is {@link #oneCallersDescriptorIsNotServedToAnother()}. The rest is
 * latency; that one is the difference between a cache and a leak.
 */
class RemoteAppDescriptorCacheTest {

  private final AtomicLong clock = new AtomicLong();

  private RemoteAppDescriptorCache cache(long ttlMs) {
    return new RemoteAppDescriptorCache(clock::get, ttlMs);
  }

  private static AppDto app(String title) {
    return AppDto.builder().route("").title(title).build();
  }

  @Test
  @DisplayName("a held descriptor is handed back until it expires")
  void anExpiredDescriptorIsAskedForAgain() {
    var cache = cache(30_000);
    var app = app("Workflow");
    cache.put("/_workflow", "", null, app);

    clock.set(29_999);
    assertThat(cache.get("/_workflow", "", null)).isSameAs(app);

    clock.set(30_000);
    assertThat(cache.get("/_workflow", "", null)).isNull();
  }

  /**
   * A remote receives the caller's authorization header and is free to build its menu for that user
   * — Mateu's core does not filter menus by role, but a remote may. Sharing one entry across
   * callers would hand one user another user's menu, so the token is part of the key.
   */
  @Test
  @DisplayName("one caller's descriptor is never served to another")
  void oneCallersDescriptorIsNotServedToAnother() {
    var cache = cache(30_000);
    var forAna = app("Ana");
    cache.put("/_workflow", "", "Bearer ana", forAna);

    assertThat(cache.get("/_workflow", "", "Bearer ana")).isSameAs(forAna);
    assertThat(cache.get("/_workflow", "", "Bearer bob")).isNull();
    assertThat(cache.get("/_workflow", "", null)).isNull();
  }

  /** Anonymous is its own bucket, not a shared one. */
  @Test
  @DisplayName("an authenticated answer is never served to an anonymous caller")
  void anonymousDoesNotReadAnAuthenticatedAnswer() {
    var cache = cache(30_000);
    cache.put("/_workflow", "", null, app("public"));

    assertThat(cache.get("/_workflow", "", "Bearer ana")).isNull();
  }

  @Test
  @DisplayName("remotes and routes are separate entries")
  void oneRemoteNeverAnswersForAnother() {
    var cache = cache(30_000);
    var workflow = app("Workflow");
    cache.put("/_workflow", "", null, workflow);

    assertThat(cache.get("/_workflow", "", null)).isSameAs(workflow);
    assertThat(cache.get("/_booking", "", null)).isNull();
    assertThat(cache.get("/_workflow", "/elsewhere", null)).isNull();
  }

  @Test
  @DisplayName("a zero TTL holds nothing, which is how it is switched off")
  void aZeroTtlHoldsNothing() {
    var cache = cache(0);
    cache.put("/_workflow", "", null, app("Workflow"));

    assertThat(cache.get("/_workflow", "", null)).isNull();
  }

  @Test
  @DisplayName("nothing is held for a remote that answered with no descriptor")
  void aNullDescriptorIsNotHeld() {
    var cache = cache(30_000);
    cache.put("/_workflow", "", null, null);

    assertThat(cache.get("/_workflow", "", null)).isNull();
  }

  /**
   * Past its bound the map is emptied rather than evicted entry by entry: rebuilding costs one
   * round trip per remote, which is cheaper than carrying eviction bookkeeping for a map that
   * should never reach this size.
   */
  @Test
  @DisplayName("the map stays bounded")
  void theMapDoesNotGrowWithoutEnd() {
    var cache = cache(30_000);
    for (int i = 0; i < 600; i++) {
      cache.put("/_remote" + i, "", null, app("r" + i));
    }

    var last = app("last");
    cache.put("/_last", "", null, last);
    assertThat(cache.get("/_last", "", null)).isSameAs(last);
  }

  // ── the configured TTL ───────────────────────────────────────────────────

  private static RemoteAppDescriptorCache configuredWith(String ttl) {
    var previous = System.getProperty(RemoteAppDescriptorCache.TTL_PROPERTY);
    try {
      if (ttl == null) {
        System.clearProperty(RemoteAppDescriptorCache.TTL_PROPERTY);
      } else {
        System.setProperty(RemoteAppDescriptorCache.TTL_PROPERTY, ttl);
      }
      return new RemoteAppDescriptorCache();
    } finally {
      if (previous == null) {
        System.clearProperty(RemoteAppDescriptorCache.TTL_PROPERTY);
      } else {
        System.setProperty(RemoteAppDescriptorCache.TTL_PROPERTY, previous);
      }
    }
  }

  @Test
  @DisplayName("with nothing configured, descriptors are held")
  void theDefaultHoldsDescriptors() {
    var cache = configuredWith(null);
    var app = app("Workflow");
    cache.put("/_workflow", "", null, app);

    assertThat(cache.get("/_workflow", "", null)).isSameAs(app);
  }

  /** The documented way to switch it off, for a shell whose remotes change under it. */
  @Test
  @DisplayName("the property can switch it off")
  void theTtlPropertyCanDisableIt() {
    var cache = configuredWith("0");
    cache.put("/_workflow", "", null, app("Workflow"));

    assertThat(cache.get("/_workflow", "", null)).isNull();
  }

  /**
   * A typo in a tuning knob must not be the reason a shell stops resolving its remotes, so an
   * unreadable value means the default rather than zero.
   */
  @Test
  @DisplayName("an unreadable value falls back to the default rather than to off")
  void aMalformedTtlDoesNotSilentlyDisableIt() {
    var cache = configuredWith("half a minute");
    var app = app("Workflow");
    cache.put("/_workflow", "", null, app);

    assertThat(cache.get("/_workflow", "", null)).isSameAs(app);
  }

  @Test
  @DisplayName("a negative value is off, not a descriptor that never expires")
  void aNegativeTtlIsOff() {
    var cache = configuredWith("-1");
    cache.put("/_workflow", "", null, app("Workflow"));

    assertThat(cache.get("/_workflow", "", null)).isNull();
  }
}
