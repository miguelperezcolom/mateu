package io.mateu.core.infra.security;

import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.security.CallerIdentity;
import io.mateu.uidl.security.PrincipalResolver;
import java.util.Collection;
import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;
import lombok.extern.slf4j.Slf4j;

/**
 * Who the caller is — the ONE place Mateu's access control ({@code @EyesOnly},
 * {@code @ReadOnlyUnless}, {@code @DisabledUnless}, YAML {@code access:}, menu visibility) gets its
 * identity from.
 *
 * <p>Mateu does NOT authenticate. It reads the identity the hosting framework already
 * authenticated, first match wins:
 *
 * <ol>
 *   <li>a {@link PrincipalResolver} bean supplied by the application;
 *   <li>the principal the framework put on the request ({@link HttpRequest#getUserPrincipal()}:
 *       Spring Security's {@code Authentication}, Micronaut's, Quarkus' {@code SecurityIdentity},
 *       the JAX-RS {@code SecurityContext} principal);
 *   <li>otherwise: {@link CallerIdentity#anonymous()} — every restricted element is denied.
 * </ol>
 *
 * A Bearer token is never read here: its payload is the client's to write. The result is cached on
 * the request.
 */
@Slf4j
public final class IdentityResolver {

  static final String ATTRIBUTE = "mateu.callerIdentity";

  private static final AtomicBoolean WARNED = new AtomicBoolean();

  private IdentityResolver() {}

  /** The caller's identity; anonymous when nothing authenticated it. */
  public static CallerIdentity resolve(HttpRequest httpRequest) {
    if (httpRequest == null) {
      return CallerIdentity.anonymous();
    }
    try {
      if (httpRequest.getAttribute(ATTRIBUTE) instanceof CallerIdentity cached) {
        return cached;
      }
    } catch (RuntimeException ignored) {
      // a request with no attribute storage
    }
    var identity = compute(httpRequest);
    try {
      httpRequest.setAttribute(ATTRIBUTE, identity);
    } catch (RuntimeException ignored) {
      // not cacheable: computed again next time
    }
    return identity;
  }

  private static CallerIdentity compute(HttpRequest httpRequest) {
    for (var resolver : beans(PrincipalResolver.class)) {
      try {
        var resolved = resolver.resolve(httpRequest);
        if (resolved != null && resolved.isPresent()) {
          return resolved.get();
        }
      } catch (RuntimeException e) {
        log.warn("PrincipalResolver {} failed: {}", resolver.getClass().getName(), e.toString());
      }
    }
    java.security.Principal principal = null;
    try {
      principal = httpRequest.getUserPrincipal();
    } catch (RuntimeException ignored) {
      // an adapter that cannot tell
    }
    return CallerIdentities.fromPrincipal(principal).orElse(CallerIdentity.anonymous());
  }

  /**
   * Logs, once per JVM, that nothing will authenticate callers — when the application registers no
   * {@link PrincipalResolver} and its framework's security module is not on the classpath. Called
   * by every adapter once the application has started.
   *
   * @param frameworkSecurityPresent whether the adapter found its framework's security module
   *     (Spring Security, quarkus-security, micronaut-security, MicroProfile JWT / Helidon
   *     security)
   * @param howToSecure the adapter's one-line hint ("add Spring Security…")
   */
  public static void warnOnStartup(boolean frameworkSecurityPresent, String howToSecure) {
    if (frameworkSecurityPresent || !beans(PrincipalResolver.class).isEmpty()) {
      return;
    }
    if (WARNED.compareAndSet(false, true)) {
      // INFO, not WARN: it is printed by every fresh app, including the starters, which restrict
      // nothing — a warning there teaches people to ignore Mateu's warnings.
      log.info(
          "No security module found. That only matters if your UI restricts something"
              + " (@EyesOnly / @ReadOnlyUnless / @DisabledUnless / YAML access:): Mateu does not"
              + " authenticate, so restricted UI then stays hidden for everyone. To secure it: {}"
              + " (or register an io.mateu.uidl.security.PrincipalResolver bean).",
          howToSecure);
    }
  }

  /** Whether a class is on the classpath (an adapter's check for its security module). */
  public static boolean present(String className) {
    try {
      Class.forName(className, false, IdentityResolver.class.getClassLoader());
      return true;
    } catch (ClassNotFoundException | LinkageError e) {
      return false;
    }
  }

  private static <T> Collection<T> beans(Class<T> type) {
    if (!MateuBeanProvider.isInitialized()) {
      return List.of();
    }
    try {
      var found = MateuBeanProvider.getBeans(type);
      return found != null ? found : List.of();
    } catch (RuntimeException e) {
      return List.of();
    }
  }
}
