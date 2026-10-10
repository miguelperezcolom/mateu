package io.mateu.core.infra;

/**
 * Framework settings, read the way the rest of Mateu's switches are ({@code mateu.layout.inference}
 * …): a JVM system property, else the equivalent environment variable — the key upper-cased with
 * dots and dashes as underscores ({@code mateu.self-base-url} → {@code MATEU_SELF_BASE_URL}). Read
 * on every call (cheap), so a test can flip a property without restarting anything.
 */
public final class MateuSettings {

  private MateuSettings() {}

  /** The setting's value, or null when it is not set (or blank). */
  public static String get(String key) {
    var value = System.getProperty(key);
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
