package io.mateu;

import io.mateu.uidl.interfaces.HttpRequest;
import io.vertx.core.http.HttpServerRequest;
import java.util.HashMap;
import java.util.Map;

public class QuarkusHttpRequest implements HttpRequest {

  private final HttpServerRequest delegate;
  private final Map<String, Object> attributes = new HashMap<>();

  public QuarkusHttpRequest(HttpServerRequest delegate) {
    this.delegate = delegate;
  }

  @Override
  public Object getAttribute(String key) {
    return attributes.get(key);
  }

  @Override
  public void setAttribute(String key, Object value) {
    attributes.put(key, value);
  }
}
