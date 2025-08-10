package io.mateu.core.infra;

import io.mateu.uidl.interfaces.HttpRequest;
import java.util.HashMap;
import java.util.Map;

public class FakeHttpRequest implements HttpRequest {

  private final Map<String, Object> attributes = new HashMap<>();

  @Override
  public Object getAttribute(String key) {
    return attributes.get(key);
  }

  @Override
  public void setAttribute(String key, Object value) {
    attributes.put(key, value);
  }
}
