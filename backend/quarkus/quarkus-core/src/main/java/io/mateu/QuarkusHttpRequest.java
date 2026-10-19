package io.mateu;

import io.mateu.uidl.interfaces.HttpRequest;
import io.vertx.core.http.HttpServerRequest;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class QuarkusHttpRequest implements HttpRequest {

  private final HttpServerRequest delegate;
  private final Map<String, Object> attributes = new HashMap<>();

  /** The SecurityIdentity a Vert.x route found on its RoutingContext, when it found one. */
  private Object identity;

  public QuarkusHttpRequest(HttpServerRequest delegate) {
    this.delegate = delegate;
  }

  /**
   * The identity Quarkus authenticated for a request served by a Vert.x ROUTE (YAML mounts): it
   * rides on the RoutingContext — {@code rc.user()} once authenticated, else the deferred identity
   * proactive authentication left there. The CDI lookup {@link #getUserPrincipal} falls back to
   * only works inside a JAX-RS request, so without this a YAML app's {@code access:} refused
   * everybody.
   */
  public QuarkusHttpRequest withIdentityOf(io.vertx.ext.web.RoutingContext rc) {
    this.identity = identityOf(rc);
    return this;
  }

  static Object identityOf(io.vertx.ext.web.RoutingContext rc) {
    try {
      Object user = rc.user();
      if (user != null) {
        return user.getClass().getMethod("getSecurityIdentity").invoke(user);
      }
      Object deferred = rc.get("io.quarkus.vertx.http.deferred-identity");
      if (deferred != null) {
        Object await = deferred.getClass().getMethod("await").invoke(deferred);
        return await.getClass().getMethod("indefinitely").invoke(await);
      }
    } catch (Exception | LinkageError e) {
      // not a Quarkus security user, or no identity: the CDI lookup decides
    }
    return null;
  }

  @Override
  public String getParameterValue(String name) {
    return delegate.getParam(name);
  }

  @Override
  public List<String> getParameterValues(String name) {
    return delegate.params().getAll(name);
  }

  @Override
  public Object getAttribute(String key) {
    return attributes.get(key);
  }

  @Override
  public void setAttribute(String key, Object value) {
    attributes.put(key, value);
  }

  /**
   * The identity Quarkus security authenticated (quarkus-oidc, smallrye-jwt, …), read through CDI
   * and reflectively, so the adapter needs no security extension. Null when there is none — no
   * extension, an anonymous identity, or no active request context.
   */
  @Override
  public java.security.Principal getUserPrincipal() {
    try {
      Object identity = this.identity;
      // the identity's own loader: Quarkus runs the app in a class loader of its own, and a type
      // from another one fails every reflective call on the object (silently: refused like anybody)
      var type =
          identity != null
              ? Class.forName(
                  "io.quarkus.security.identity.SecurityIdentity",
                  false,
                  identity.getClass().getClassLoader())
              : Class.forName("io.quarkus.security.identity.SecurityIdentity");
      if (identity == null) {
        var instance = jakarta.enterprise.inject.spi.CDI.current().select(type);
        if (!instance.isResolvable()) {
          return null;
        }
        identity = instance.get();
      }
      if (Boolean.TRUE.equals(type.getMethod("isAnonymous").invoke(identity))) {
        return null;
      }
      var principal = (java.security.Principal) type.getMethod("getPrincipal").invoke(identity);
      var base =
          io.mateu.core.infra.security.CallerIdentities.fromPrincipal(principal)
              .orElse(io.mateu.uidl.security.CallerIdentity.anonymous());
      var roles = new java.util.LinkedHashSet<>(base.roles());
      if (type.getMethod("getRoles").invoke(identity) instanceof java.util.Collection<?> granted) {
        granted.forEach(role -> roles.add(String.valueOf(role)));
      }
      return new io.mateu.core.infra.security.AuthenticatedPrincipal(
          new io.mateu.uidl.security.CallerIdentity(
              principal != null ? principal.getName() : base.name(),
              java.util.List.copyOf(roles),
              base.groups(),
              base.scopes(),
              base.permissions()));
    } catch (ClassNotFoundException e) {
      return null; // no Quarkus security extension
    } catch (Exception | LinkageError e) {
      return null; // no request context active, or the identity could not be read
    }
  }

  @Override
  public String getRemoteAddress() {
    var remote = delegate.remoteAddress();
    return remote == null ? null : remote.hostAddress();
  }

  @Override
  public String getHeaderValue(String key) {
    return delegate.getHeader(key);
  }

  @Override
  public List<String> getHeaderValues(String key) {
    return delegate.headers().getAll(key);
  }

  @Override
  public String path() {
    return delegate.path();
  }

  @Override
  public List<String> getParameterNames() {
    return delegate.params().names().stream().toList();
  }
}
