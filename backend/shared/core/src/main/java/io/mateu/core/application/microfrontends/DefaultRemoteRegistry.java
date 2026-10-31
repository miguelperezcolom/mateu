package io.mateu.core.application.microfrontends;

import io.mateu.uidl.remote.RemoteCatalogSupplier;
import io.mateu.uidl.remote.RemoteDescriptor;
import io.mateu.uidl.remote.RemoteRegistry;
import java.net.URI;
import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import lombok.extern.slf4j.Slf4j;

/**
 * Mateu's own {@link RemoteRegistry}: the remotes the {@link RemoteCatalogSupplier} beans return,
 * with the ones configured as properties on top (same id = the property wins):
 *
 * <pre>
 * mateu.remotes=content,orders
 * mateu.remotes.content.base-url=https://content.acme.com
 * mateu.remotes.content.timeout-ms=150
 * mateu.remotes.content.identity=forward-authorization
 * </pre>
 *
 * <p>A url belongs to a remote when it has the same scheme, host and port and its path is the
 * remote's path or under it ({@code https://a.com/x} owns {@code https://a.com/x/y}, not {@code
 * https://a.com/xy}). A base url may also be a path on this same server ({@code /_content-hub}): it
 * owns the micro frontends declared with that same relative base, and the host calls it at its own
 * base url ({@code mateu.self-base-url}, else the adapter's view of the local socket).
 */
@Slf4j
public final class DefaultRemoteRegistry implements RemoteRegistry {

  public static final String REMOTES = "mateu.remotes";

  private final Map<String, RemoteDescriptor> remotes;

  public DefaultRemoteRegistry(
      Collection<RemoteCatalogSupplier> suppliers, Function<String, String> settings) {
    var all = new LinkedHashMap<String, RemoteDescriptor>();
    for (var supplier : suppliers) {
      var supplied = supplier.remotes();
      if (supplied != null) {
        supplied.forEach(remote -> register(all, remote));
      }
    }
    var ids = settings.apply(REMOTES);
    if (ids != null) {
      for (var id : ids.split(",")) {
        id = id.trim();
        if (id.isEmpty()) continue;
        var prefix = REMOTES + "." + id + ".";
        var timeout = settings.apply(prefix + "timeout-ms");
        Integer timeoutMs = null;
        if (timeout != null && !timeout.isBlank()) {
          try {
            timeoutMs = Integer.parseInt(timeout.trim());
          } catch (NumberFormatException e) {
            log.warn("Ignoring {}timeout-ms={}: not a number", prefix, timeout);
          }
        }
        register(
            all,
            new RemoteDescriptor(
                id,
                settings.apply(prefix + "base-url"),
                timeoutMs,
                settings.apply(prefix + "identity")));
      }
    }
    this.remotes = Map.copyOf(all);
  }

  private static void register(Map<String, RemoteDescriptor> all, RemoteDescriptor remote) {
    if (remote == null || remote.id() == null || remote.id().isBlank()) {
      return;
    }
    if (parse(remote.baseUrl()) == null) {
      log.warn(
          "Remote {} is not registered: its base url {} is neither an absolute http(s) url nor a path",
          remote.id(),
          remote.baseUrl());
      return;
    }
    all.put(remote.id(), remote);
  }

  @Override
  public Optional<RemoteDescriptor> byId(String id) {
    return Optional.ofNullable(id == null ? null : remotes.get(id));
  }

  @Override
  public Optional<RemoteDescriptor> forUrl(String url) {
    var target = parse(url);
    if (target == null) {
      return Optional.empty();
    }
    RemoteDescriptor best = null;
    int bestLength = -1;
    for (var remote : remotes.values()) {
      var base = parse(remote.baseUrl());
      if (base != null && owns(base, target) && base.getPath().length() > bestLength) {
        best = remote;
        bestLength = base.getPath().length();
      }
    }
    return Optional.ofNullable(best);
  }

  /** Every registered remote (for diagnostics). */
  public List<RemoteDescriptor> all() {
    return new ArrayList<>(remotes.values());
  }

  /** Whether {@code target} is {@code base} or under it. */
  static boolean owns(URI base, URI target) {
    if (base.getScheme() == null || target.getScheme() == null) {
      // two paths on this server: only the path counts
      if (base.getScheme() != null || target.getScheme() != null) {
        return false;
      }
    } else if (!base.getScheme().equals(target.getScheme())
        || !base.getHost().equals(target.getHost())
        || port(base) != port(target)) {
      return false;
    }
    var basePath = stripSlash(base.getPath());
    var targetPath = stripSlash(target.getPath());
    return targetPath.equals(basePath) || targetPath.startsWith(basePath + "/");
  }

  private static String stripSlash(String path) {
    if (path == null) return "";
    return path.endsWith("/") ? path.substring(0, path.length() - 1) : path;
  }

  private static int port(URI uri) {
    if (uri.getPort() >= 0) return uri.getPort();
    return "https".equals(uri.getScheme()) ? 443 : 80;
  }

  /**
   * An absolute http(s) url without user info, or a path on this server ({@code /x}), normalised;
   * null otherwise.
   */
  static URI parse(String url) {
    if (url == null || url.isBlank()) {
      return null;
    }
    try {
      var uri = URI.create(url.trim()).normalize();
      if (uri.getScheme() == null
          && uri.getRawAuthority() == null
          && uri.getPath() != null
          && uri.getPath().startsWith("/")
          && !uri.getPath().startsWith("//")
          && !uri.getPath().contains("..")) {
        return new URI(null, null, uri.getPath(), null);
      }
      var scheme = uri.getScheme() == null ? null : uri.getScheme().toLowerCase(Locale.ROOT);
      if (!("http".equals(scheme) || "https".equals(scheme))
          || uri.getHost() == null
          || uri.getRawUserInfo() != null
          || (uri.getPath() != null && uri.getPath().contains(".."))) {
        return null;
      }
      return new URI(
          scheme,
          null,
          uri.getHost().toLowerCase(Locale.ROOT),
          uri.getPort(),
          uri.getPath() == null ? "" : uri.getPath(),
          null,
          null);
    } catch (Exception e) {
      return null;
    }
  }
}
