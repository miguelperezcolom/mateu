package io.mateu.core.application.runaction;

import io.mateu.dtos.AppDto;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.LongSupplier;

/**
 * The remote app descriptors a shell has already asked for, held briefly.
 *
 * <p>A shell fronting remote menus asks each remote for its {@link AppDto} — title, menu, home
 * wiring — every time it resolves a route, and that ask is an HTTP round trip that lands on the
 * remote's HOME route, so the remote renders its home just to answer "here is my menu". Measured on
 * the reference deployment that hop took 777 ms to return 418 bytes, and it happens on every
 * navigation: three clicks within one remote made three of them (see {@code
 * RemoteMenuFetchCountSyncTest}).
 *
 * <p>The descriptor is app-shaped, not request-shaped: it changes when the remote is redeployed and
 * at no other time. The TTL is therefore what bounds how long a redeployed remote's new menu takes
 * to show up in the shell — 30 s by default, and the reason it is not longer.
 *
 * <p><b>The key includes who is asking.</b> A remote receives the caller's {@code authorization}
 * header and is free to answer with a menu built for that user; Mateu's core does not filter menus
 * by role, but a remote may. Keying on the base URL alone would serve one user's menu to another,
 * which is a privacy bug rather than a slow page — so the token is part of the key. It is stored as
 * a SHA-256 digest: the map lives for the life of the process, and a bearer token is not something
 * to keep in memory any longer than the request that carried it.
 */
@Named
@Singleton
public class RemoteAppDescriptorCache {

  /** How long a descriptor stays usable. {@code 0} disables the cache entirely. */
  static final String TTL_PROPERTY = "mateu.remote-menu.descriptor-ttl-ms";

  static final String TTL_ENV = "MATEU_REMOTE_MENU_DESCRIPTOR_TTL_MS";
  static final long DEFAULT_TTL_MS = 30_000;

  /**
   * Enough for every remote a shell fronts, several users deep. Past it the map is emptied rather
   * than evicted one by one: this is a latency cache, and rebuilding it costs one round trip per
   * remote — cheaper than carrying eviction bookkeeping for a map that should never get here.
   */
  private static final int MAX_ENTRIES = 512;

  private final Map<String, Entry> entries = new ConcurrentHashMap<>();
  private final LongSupplier clock;
  private final long ttlMs;

  public RemoteAppDescriptorCache() {
    this(System::currentTimeMillis, configuredTtlMs());
  }

  RemoteAppDescriptorCache(LongSupplier clock, long ttlMs) {
    this.clock = clock;
    this.ttlMs = ttlMs;
  }

  private record Entry(AppDto app, long expiresAt) {}

  /** The descriptor for this remote and this caller, or null if none is held or it has expired. */
  AppDto get(String baseUrl, String route, String authorization) {
    if (ttlMs <= 0) {
      return null;
    }
    var entry = entries.get(key(baseUrl, route, authorization));
    if (entry == null) {
      return null;
    }
    if (clock.getAsLong() >= entry.expiresAt()) {
      entries.remove(key(baseUrl, route, authorization));
      return null;
    }
    return entry.app();
  }

  void put(String baseUrl, String route, String authorization, AppDto app) {
    if (ttlMs <= 0 || app == null) {
      return;
    }
    if (entries.size() >= MAX_ENTRIES) {
      entries.clear();
    }
    entries.put(key(baseUrl, route, authorization), new Entry(app, clock.getAsLong() + ttlMs));
  }

  private static String key(String baseUrl, String route, String authorization) {
    return baseUrl + "\n" + route + "\n" + fingerprint(authorization);
  }

  /**
   * The caller's identity as far as this cache is concerned. Anonymous is its own bucket rather
   * than a shared one, so an unauthenticated resolution never reads an authenticated answer.
   */
  private static String fingerprint(String authorization) {
    if (authorization == null || authorization.isBlank()) {
      return "anonymous";
    }
    try {
      var digest = MessageDigest.getInstance("SHA-256");
      return HexFormat.of()
          .formatHex(digest.digest(authorization.getBytes(StandardCharsets.UTF_8)));
    } catch (Exception e) {
      // No SHA-256 in this JVM: share nothing rather than key on the raw token. Every lookup then
      // misses, which costs the round trip this class exists to avoid and breaks nothing.
      return "unhashable-" + System.identityHashCode(authorization);
    }
  }

  private static long configuredTtlMs() {
    var configured = System.getProperty(TTL_PROPERTY);
    if (configured == null || configured.isBlank()) {
      configured = System.getenv(TTL_ENV);
    }
    if (configured == null || configured.isBlank()) {
      return DEFAULT_TTL_MS;
    }
    try {
      return Math.max(0, Long.parseLong(configured.trim()));
    } catch (NumberFormatException e) {
      return DEFAULT_TTL_MS;
    }
  }
}
