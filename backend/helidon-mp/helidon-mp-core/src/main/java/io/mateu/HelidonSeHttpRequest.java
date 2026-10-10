package io.mateu;

import io.helidon.http.HeaderNames;
import io.helidon.webserver.http.ServerRequest;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * {@link HttpRequest} backed by a Helidon SE {@link ServerRequest} — for the routes the adapter
 * registers on the Helidon routing itself (MCP, YAML mounts), outside Jersey.
 */
public class HelidonSeHttpRequest implements HttpRequest {

  private final ServerRequest delegate;
  private final Map<String, Object> attributes = new HashMap<>();

  public HelidonSeHttpRequest(ServerRequest delegate) {
    this.delegate = delegate;
  }

  @Override
  public String getParameterValue(String name) {
    return delegate.query().contains(name) ? delegate.query().get(name) : null;
  }

  @Override
  public List<String> getParameterValues(String name) {
    return delegate.query().contains(name) ? delegate.query().all(name) : List.of();
  }

  @Override
  public List<String> getParameterNames() {
    return new ArrayList<>(delegate.query().names());
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
    return delegate.headers().first(HeaderNames.create(key)).orElse(null);
  }

  @Override
  public List<String> getHeaderValues(String key) {
    return delegate.headers().all(HeaderNames.create(key), List::of);
  }

  @Override
  public String path() {
    return delegate.path().path();
  }
}
