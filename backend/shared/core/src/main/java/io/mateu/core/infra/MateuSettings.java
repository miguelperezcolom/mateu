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
 * Read on every call (cheap), so a test can flip a property without restarting anything. Before
 * 3.0-alpha.426 only the system property and the environment variable were read: a key written in
 * {@code application.properties} was silently ignored.
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
    return () -> SOURCES.remove(source);
  }

  /** The setting's value, or null when it is not set (or blank). */
  public static String get(String key) {
    var value = System.getProperty(key);
    if (isBlank(value)) {
      value = fromSources(key);
    }
    if (isBlank(value)) {
      value = System.getenv(envName(key));
    }
    return isBlank(value) ? null : value.trim();
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
  private static String fromSources(String key) {
    if (SOURCES.isEmpty()) {
      return null;
    }
    Source current;
    try {
      current = SOURCES.get(0);
    } catch (IndexOutOfBoundsException e) {
      return null; // unregistered meanwhile
    }
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
