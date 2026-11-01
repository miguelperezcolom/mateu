package io.mateu;

import io.helidon.webserver.http.ServerRequest;
import jakarta.enterprise.inject.Any;
import jakarta.enterprise.inject.spi.BeanManager;
import java.security.Principal;
import java.util.logging.Logger;
import org.eclipse.microprofile.config.Config;

/**
 * Who is calling on the routes the adapter serves on the Helidon routing itself — the streamed
 * actions ({@code /mateu/v3/sse/**}), MCP and the YAML mounts — which run OUTSIDE Jersey, and so
 * outside the JAX-RS login check of a MicroProfile JWT app ({@code @LoginConfig}).
 *
 * <p>Before, those routes saw no principal at all and ran any action an anonymous caller named — an
 * app that required a login for {@code /mateu/v3/sync/**} answered the same action,
 * unauthenticated, on {@code /mateu/v3/sse/**}. Now:
 *
 * <ul>
 *   <li>the caller is the principal Helidon security attached to the request (its {@code
 *       SecurityContext}, when helidon-security protects the web server), else nobody;
 *   <li>when the application requires authentication — a JAX-RS application annotated
 *       {@code @LoginConfig}, or {@value #REQUIRED_PROPERTY}{@code =true} — an unauthenticated call
 *       is not served here: a streamed action falls through to Jersey (which authenticates it, at
 *       the price of buffering the stream), MCP and the YAML mounts answer 401.
 * </ul>
 */
final class HelidonSeIdentity {

  /** Forces the decision; absent = inferred from {@code @LoginConfig}. */
  static final String REQUIRED_PROPERTY = "mateu.helidon.authentication-required";

  private static final Logger LOG = Logger.getLogger(HelidonSeIdentity.class.getName());

  private HelidonSeIdentity() {}

  /** The principal Helidon security authenticated for this request, or null. */
  static Principal principalOf(ServerRequest request) {
    try {
      var type = Class.forName("io.helidon.security.SecurityContext");
      var context = request.context().get(type);
      if (context.isEmpty()) {
        return null;
      }
      var security = context.get();
      var authenticated = type.getMethod("isAuthenticated").invoke(security);
      if (!Boolean.TRUE.equals(authenticated)) {
        return null;
      }
      var principal = type.getMethod("userPrincipal").invoke(security);
      if (principal instanceof java.util.Optional<?> optional) {
        principal = optional.orElse(null);
      }
      return principal instanceof Principal p ? p : null;
    } catch (ClassNotFoundException e) {
      return null; // no helidon-security on the classpath
    } catch (ReflectiveOperationException | RuntimeException e) {
      LOG.fine("Could not read the Helidon security context: " + e);
      return null;
    }
  }

  /** Whether the application requires an authenticated caller for its Mateu endpoints. */
  static boolean authenticationRequired(Config config, BeanManager beanManager) {
    var declared = config.getOptionalValue(REQUIRED_PROPERTY, Boolean.class);
    if (declared.isPresent()) {
      return declared.get();
    }
    try {
      for (var bean : beanManager.getBeans(Object.class, Any.Literal.INSTANCE)) {
        for (var annotation : bean.getBeanClass().getAnnotations()) {
          if ("org.eclipse.microprofile.auth.LoginConfig"
              .equals(annotation.annotationType().getName())) {
            return true;
          }
        }
      }
    } catch (RuntimeException e) {
      LOG.fine("Could not scan the beans for @LoginConfig: " + e);
    }
    return false;
  }
}
