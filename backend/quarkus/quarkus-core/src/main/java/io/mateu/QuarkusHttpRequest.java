package io.mateu;

import io.mateu.uidl.interfaces.HttpRequest;
import io.vertx.core.http.HttpServerRequest;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class QuarkusHttpRequest implements HttpRequest {

  private final HttpServerRequest delegate;
  private final Map<String, Object> attributes = new HashMap<>();

  public QuarkusHttpRequest(HttpServerRequest delegate) {
    this.delegate = delegate;
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
      var type = Class.forName("io.quarkus.security.identity.SecurityIdentity");
      var instance = jakarta.enterprise.inject.spi.CDI.current().select(type);
      if (!instance.isResolvable()) {
        return null;
      }
      Object identity = instance.get();
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
