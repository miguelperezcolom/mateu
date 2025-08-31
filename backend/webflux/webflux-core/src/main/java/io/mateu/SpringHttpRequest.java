package io.mateu;

import io.mateu.uidl.interfaces.HttpRequest;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.server.reactive.ServerHttpRequest;

public class SpringHttpRequest implements HttpRequest {

  private final ServerHttpRequest delegate;
  private final Map<String, Object> attributes = new HashMap<>();

  public SpringHttpRequest(ServerHttpRequest delegate) {
    this.delegate = delegate;
  }

  @Override
  public String getParameterValue(String name) {
    return delegate.getQueryParams().getFirst(name);
  }

  @Override
  public List<String> getParameterValues(String name) {
    return delegate.getQueryParams().get(name);
  }

  @Override
  public Object getAttribute(String key) {
    return attributes.get(key);
  }

  @Override
  public void setAttribute(String key, Object value) {
    attributes.put(key, value);
  }

  @Override
  public String getHeaderValue(String key) {
    return delegate.getHeaders().getFirst(key);
  }

  @Override
  public List<String> getHeaderValues(String key) {
    return delegate.getHeaders().get(key);
  }

  @Override
  public String path() {
    return delegate.getPath().value();
  }
}
