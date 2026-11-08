package io.mateu.core.infra;

import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * Framework settings ({@code mateu.actions.strict}, {@code mateu.errors.detailed}, {@code
 * mateu.remote.allowed-hosts}, {@code mateu.self-base-url}, the inference switches…), read from, in
 * order:
 *
 * <ol>
 *   <li>a JVM system property of that name;
 *   <li>the host framework's configuration, through the {@link Source}s its adapter registers —
 *       Spring's {@code Environment}, Micronaut's, MicroProfile Config on Quarkus and Helidon — so
 *       a key in {@code application.properties} / {@code application.yml} is honoured like any of
 *       the framework's own (and with the framework's own precedence: profiles, command-line
 *       args…);
 *   <li>the equivalent environment variable — the key upper-cased with dots and dashes as
 *       underscores ({@code mateu.self-base-url} → {@code MATEU_SELF_BASE_URL}).
 * </ol>
 *
 * The system property is read on every call (a test can flip one without restarting anything). What
 * the framework configuration and the environment answer is MEMOISED per key: resolving a key
 * through Spring's {@code Environment} walks every property source with relaxed binding, and the
 * settings are read many times per request (~6% of a request's CPU on the e2e SUT, 2026-11). The
 * memo belongs to the registered source, so it starts empty whenever a container registers or
 * unregisters its configuration. Configuration does not change while an app runs; an app that
 * changes it at runtime (a context refresh, Spring Cloud's {@code EnvironmentChangeEvent} — both
 * handled by the Spring adapters — or its own mechanism) calls {@link #refresh()}.
 *
 * <p>Before 3.0-alpha.426 only the system property and the environment variable were read: a key
 * written in {@code application.properties} was silently ignored.
 */
public final class MateuSettings {

  /**
   * Where an adapter exposes its framework's configuration. Returns the raw value of {@code key},
   * or null when that configuration does not set it; must not throw for an unknown key.
   */
  @FunctionalInterface
  public interface Source {
    String get(String key);
  }

  private static final List<Source> SOURCES = new CopyOnWriteArrayList<>();

  /** Answers above this many distinct keys are not memoised (settings are a finite set). */
  static final int MAX_MEMOISED_KEYS = 1024;

  /** What the current source + the environment answer, per key ({@link #UNSET} for nothing). */
  private static volatile Memo memo = new Memo(null);

  private static final String UNSET = new String("<unset>");

  private record Memo(
      Source source, java.util.concurrent.ConcurrentHashMap<String, String> values) {
    Memo(Source source) {
      this(source, new java.util.concurrent.ConcurrentHashMap<>());
    }
  }

  private MateuSettings() {}

  /**
   * Registers a framework configuration (an adapter does it once its container has started). The
   * most recently registered source is the one asked (the previous one is asked again once it is
   * removed); returns a handle that removes it (a container shutting down, a test).
   */
  public static AutoCloseable register(Source source) {
    if (source == null) {
      return () -> {};
    }
    SOURCES.add(0, source);
    refresh();
    return () -> {
      SOURCES.remove(source);
      refresh();
    };
  }

  /**
   * Forgets what the framework configuration and the environment answered: the next read of each
   * key asks them again. For an app whose configuration changes while it runs.
   */
  public static void refresh() {
    memo = new Memo(null);
  }

  /** The setting's value, or null when it is not set (or blank). */
  public static String get(String key) {
    var value = System.getProperty(key);
    if (!isBlank(value)) {
      return value.trim();
    }
    return memoised(key);
  }

  /** The framework configuration's answer, else the environment's — memoised per source. */
  private static String memoised(String key) {
    var current = currentSource();
    var m = memo;
    if (m.source() != current) {
      m = new Memo(current);
      memo = m;
    }
    var known = m.values().get(key);
    if (known != null) {
      return known == UNSET ? null : known;
    }
    var value = current == null ? null : fromSource(current, key);
    if (isBlank(value)) {
      value = System.getenv(envName(key));
    }
    var answer = isBlank(value) ? null : value.trim();
    if (m.values().size() < MAX_MEMOISED_KEYS) {
      m.values().put(key, answer == null ? UNSET : answer);
    }
    return answer;
  }

  /** Whether a boolean setting is {@code true}. */
  public static boolean isTrue(String key) {
    return Boolean.parseBoolean(get(key));
  }

  /**
   * The CURRENT framework configuration only — the most recently registered one, like {@code
   * MateuBeanProvider}'s "last container wins": with several containers in one JVM (a test suite's
   * cached contexts) a key set in an older one must not leak into the newer one.
   */
  private static Source currentSource() {
    if (SOURCES.isEmpty()) {
      return null;
    }
    try {
      return SOURCES.get(0);
    } catch (IndexOutOfBoundsException e) {
      return null; // unregistered meanwhile
    }
  }

  private static String fromSource(Source current, String key) {
    try {
      return current.get(key);
    } catch (RuntimeException e) {
      // a misbehaving source never breaks a setting read: the environment variable decides
      return null;
    }
  }

  private static boolean isBlank(String value) {
    return value == null || value.isBlank();
  }

  static String envName(String key) {
    return key.toUpperCase(java.util.Locale.ROOT).replace('.', '_').replace('-', '_');
  }
}
