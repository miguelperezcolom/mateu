package io.mateu;

import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

public class MicronautHttpRequest implements HttpRequest {

  private final io.micronaut.http.HttpRequest<?> delegate;

  public MicronautHttpRequest(io.micronaut.http.HttpRequest<?> delegate) {
    this.delegate = delegate;
  }

  @Override
  public String getParameterValue(String name) {
    return delegate.getParameters().get(name);
  }

  @Override
  public List<String> getParameterValues(String name) {
    return delegate.getParameters().getAll(name);
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
    return delegate.getHeaders().get(key);
  }

  @Override
  public List<String> getHeaderValues(String key) {
    return delegate.getHeaders().getAll(key);
  }
}
