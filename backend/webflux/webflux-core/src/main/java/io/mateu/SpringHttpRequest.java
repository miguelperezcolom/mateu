package io.mateu;

import io.mateu.uidl.interfaces.HttpRequest;
import java.util.HashMap;
import java.util.Map;

public class SpringHttpRequest implements HttpRequest {

  private final org.springframework.http.HttpRequest delegate;
  private final Map<String, Object> attributes = new HashMap<>();

  public SpringHttpRequest(org.springframework.http.HttpRequest delegate) {
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
