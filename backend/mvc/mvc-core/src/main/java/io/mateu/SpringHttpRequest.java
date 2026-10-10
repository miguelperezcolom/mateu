package io.mateu;

import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Collections;
import java.util.List;

public class SpringHttpRequest implements HttpRequest {

  private final HttpServletRequest delegate;

  public SpringHttpRequest(HttpServletRequest delegate) {
    this.delegate = delegate;
  }

  @Override
  public String getParameterValue(String name) {
    return delegate.getParameter(name);
  }

  @Override
  public List<String> getParameterValues(String name) {
    // getParameterValues answers null for an absent parameter, and List.of(null array) throws:
    // answer an empty list, as the Micronaut, Quarkus and Helidon adapters do.
    var values = delegate.getParameterValues(name);
    return values != null ? List.of(values) : List.of();
  }

  @Override
  public Object getAttribute(String key) {
    return delegate.getAttribute(key);
  }

  @Override
  public void setAttribute(String key, Object value) {
    delegate.setAttribute(key, value);
  }

  @Override
  public String getHeaderValue(String key) {
    return delegate.getHeader(key);
  }

  @Override
  public List<String> getHeaderValues(String key) {
    return Collections.list(delegate.getHeaders(key));
  }

  @Override
  public String getSelfBaseUrl() {
    // the LOCAL socket this request arrived on — not the Host header, which the client sets
    if (delegate.isSecure() || delegate.getLocalPort() <= 0) {
      return null;
    }
    return "http://localhost:" + delegate.getLocalPort();
  }

  @Override
  public String path() {
    return delegate.getServletPath();
  }

  @Override
  public List<String> getParameterNames() {
    return Collections.list(delegate.getParameterNames());
  }
}
