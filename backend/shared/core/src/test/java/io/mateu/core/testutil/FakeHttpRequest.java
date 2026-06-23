package io.mateu.core.testutil;

import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/** Minimal real {@link HttpRequest} for unit tests (so default methods run for real). */
public class FakeHttpRequest implements HttpRequest {

  private final RunActionRqDto rq;
  private final Map<String, Object> attributes = new HashMap<>();

  public FakeHttpRequest(RunActionRqDto rq) {
    this.rq = rq;
  }

  public FakeHttpRequest withAttribute(String key, Object value) {
    attributes.put(key, value);
    return this;
  }

  @Override
  public RunActionRqDto runActionRq() {
    return rq;
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
  public String getParameterValue(String name) {
    return null;
  }

  @Override
  public List<String> getParameterValues(String name) {
    return List.of();
  }

  @Override
  public String getHeaderValue(String key) {
    return null;
  }

  @Override
  public List<String> getHeaderValues(String key) {
    return List.of();
  }

  @Override
  public String path() {
    return "";
  }

  @Override
  public List<String> getParameterNames() {
    return List.of();
  }
}
