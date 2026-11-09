package io.mateu.explorer.examples.distributed;

/**
 * Where the Explorer's remotes live. Every url is an env var (or a -D system property of the same
 * name), so the remotes can run on any port — the defaults are the ports of "Run the distributed
 * examples" in the README:
 *
 * <ul>
 *   <li>{@code EXPLORER_JAVA_REMOTE_URL} — remotes/java-remote (default http://localhost:8641)
 *   <li>{@code EXPLORER_YAML_REMOTE_URL} — remotes/yaml-remote (default http://localhost:8642)
 *   <li>{@code EXPLORER_STATIC_REMOTE_URL} — remotes/serve-static.mjs (default http://localhost:8643)
 *   <li>{@code EXPLORER_PYTHON_REMOTE_URL} — remotes/python-remote (default http://localhost:8644)
 *   <li>{@code EXPLORER_DOWN_REMOTE_URL} — a remote nobody serves (default http://127.0.0.1:59999; not port 9, which browsers refuse as unsafe)
 * </ul>
 */
public final class Remotes {

  private Remotes() {}

  public static String java() {
    return url("EXPLORER_JAVA_REMOTE_URL", "http://localhost:8641");
  }

  public static String yaml() {
    return url("EXPLORER_YAML_REMOTE_URL", "http://localhost:8642");
  }

  public static String staticBundle() {
    return url("EXPLORER_STATIC_REMOTE_URL", "http://localhost:8643");
  }

  public static String python() {
    return url("EXPLORER_PYTHON_REMOTE_URL", "http://localhost:8644");
  }

  public static String down() {
    return url("EXPLORER_DOWN_REMOTE_URL", "http://127.0.0.1:59999");
  }

  private static String url(String name, String fallback) {
    var value = System.getenv(name);
    if (value == null || value.isBlank()) {
      value = System.getProperty(name);
    }
    if (value == null || value.isBlank()) {
      value = fallback;
    }
    return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
  }
}
