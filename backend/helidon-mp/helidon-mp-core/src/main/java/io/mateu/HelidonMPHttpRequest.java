package io.mateu;

import io.helidon.http.HeaderNames;
import io.helidon.webserver.http.ServerRequest;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class HelidonMPHttpRequest implements HttpRequest {

  private final ServerRequest delegate;
  private final Map<String, Object> attributes = new HashMap<>();

  public HelidonMPHttpRequest(ServerRequest delegate) {
    this.delegate = delegate;
  }

  @Override
  public String getParameterValue(String name) {
    return delegate.query().get(name);
  }

  @Override
  public List<String> getParameterValues(String name) {
    return delegate.query().getAllRaw(name);
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
    return delegate.headers().get(HeaderNames.create(key)).get();
  }

  @Override
  public List<String> getHeaderValues(String key) {
    return delegate.headers().get(HeaderNames.create(key)).allValues();
  }

  @Override
  public String path() {
    return delegate.path().rawPath();
  }
}
