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
    return List.of(delegate.getParameterValues(name));
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
  public String path() {
    return delegate.getServletPath();
  }
}
