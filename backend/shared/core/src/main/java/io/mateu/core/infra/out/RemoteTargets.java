package io.mateu.core.infra.out;

import io.mateu.core.infra.MateuSettings;
import java.net.URI;
import java.util.Arrays;
import java.util.Locale;

/**
 * What a server-to-server call to another Mateu app (federated {@code RemoteMenu}s) may target.
 *
 * <p>The target of such a call is built from DECLARED configuration (the remote menu's {@code
 * baseUrl}) and, for a relative {@code baseUrl}, from this server's own base url — never from the
 * request: it used to be resolved against the {@code Origin} header, which any non-browser client
 * sets to whatever it likes, so the server could be made to POST to an internal host.
 *
 * <ul>
 *   <li>{@value #SELF_BASE_URL} — the base url a relative remote is resolved against ({@code
 *       https://shell.acme.com}); when unset the adapter's view of the local socket is used, when
 *       it can tell (plain http only);
 *   <li>{@value #ALLOWED_HOSTS} — an optional allow-list ({@code forms.acme.com,
 *       orders.internal:8080}); when set, any other host is refused. An entry without a port allows
 *       every port of that host.
 * </ul>
 */
public final class RemoteTargets {

  public static final String SELF_BASE_URL = "mateu.self-base-url";
  public static final String ALLOWED_HOSTS = "mateu.remote.allowed-hosts";

  private RemoteTargets() {}

  /** The configured self base url, or null. */
  public static String configuredSelfBaseUrl() {
    var configured = MateuSettings.get(SELF_BASE_URL);
    if (configured == null) {
      return null;
    }
    return configured.endsWith("/") ? configured.substring(0, configured.length() - 1) : configured;
  }

  /**
   * Refuses a target that is not plain http(s), carries user info, or (when the allow-list is
   * configured) names a host outside it.
   *
   * @throws IllegalArgumentException when the target is refused
   */
  public static void check(URI target) {
    var scheme = target.getScheme();
    if (scheme == null
        || !("http".equalsIgnoreCase(scheme) || "https".equalsIgnoreCase(scheme))
        || target.getHost() == null
        || target.getRawUserInfo() != null) {
      throw new IllegalArgumentException("Not a valid remote Mateu target: " + target);
    }
    var allowed = MateuSettings.get(ALLOWED_HOSTS);
    if (allowed == null) {
      return;
    }
    var host = target.getHost().toLowerCase(Locale.ROOT);
    int port = target.getPort();
    boolean ok =
        Arrays.stream(allowed.split(","))
            .map(String::trim)
            .filter(s -> !s.isEmpty())
            .map(s -> s.toLowerCase(Locale.ROOT))
            .anyMatch(
                entry -> {
                  int colon = entry.lastIndexOf(':');
                  if (colon > 0 && !entry.endsWith("]")) {
                    return entry.substring(0, colon).equals(host)
                        && entry.substring(colon + 1).equals(String.valueOf(port));
                  }
                  return entry.equals(host);
                });
    if (!ok) {
      throw new IllegalArgumentException(
          "Remote host " + host + " is not in " + ALLOWED_HOSTS + " (" + allowed + ")");
    }
  }
}
