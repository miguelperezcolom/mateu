package io.mateu.core.infra;

import java.util.function.Function;

/**
 * Framework settings, read the way the rest of Mateu's switches are ({@code mateu.layout.inference}
 * …): a JVM system property, else the equivalent environment variable — the key upper-cased with
 * dots and dashes as underscores ({@code mateu.self-base-url} → {@code MATEU_SELF_BASE_URL}). Read
 * on every call (cheap), so a test can flip a property without restarting anything.
 *
 * <p>An adapter plugs its framework's configuration in ({@link #setSource}): Spring's {@code
 * Environment}, MicroProfile Config (Quarkus, Helidon), Micronaut's environment — so a key in
 * {@code application.properties} / {@code application.yml} is read too. The framework's value wins;
 * the system property and the environment variable remain the fallback.
 */
public final class MateuSettings {

  private static volatile Function<String, String> source;

  private MateuSettings() {}

  /** Plugs the hosting framework's configuration in (null removes it). Set by each adapter. */
  public static void setSource(Function<String, String> source) {
    MateuSettings.source = source;
  }

  /** The setting's value, or null when it is not set (or blank). */
  public static String get(String key) {
    String value = null;
    var framework = source;
    if (framework != null) {
      try {
        value = framework.apply(key);
      } catch (RuntimeException ignored) {
        // a framework that cannot resolve the key: fall back to the JVM / environment lookup
      }
    }
    if (value == null || value.isBlank()) {
      value = System.getProperty(key);
    }
    if (value == null || value.isBlank()) {
      value = System.getenv(envName(key));
    }
    return value == null || value.isBlank() ? null : value.trim();
  }

  /** Whether a boolean setting is {@code true}. */
  public static boolean isTrue(String key) {
    return Boolean.parseBoolean(get(key));
  }

  static String envName(String key) {
    return key.toUpperCase(java.util.Locale.ROOT).replace('.', '_').replace('-', '_');
  }
}
