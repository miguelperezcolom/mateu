package io.mateu.core.infra;

import io.mateu.uidl.interfaces.HttpRequest;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class FakeHttpRequest implements HttpRequest {

  private final Map<String, Object> attributes = new HashMap<>();

  @Override
  public String getParameterValue(String name) {
    return "";
  }

  @Override
  public List<String> getParameterValues(String name) {
    return List.of();
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
    return "";
  }

  @Override
  public List<String> getHeaderValues(String key) {
    return List.of();
  }

  @Override
  public String path() {
    return "";
  }
}
