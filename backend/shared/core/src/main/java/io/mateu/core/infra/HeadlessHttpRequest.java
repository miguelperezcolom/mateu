package io.mateu.core.infra;

import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * A minimal, dependency-light {@link HttpRequest} with no servlet/reactive backing — for driving
 * the framework OUTSIDE a live request (build-time export, CLIs, tests). It carries a {@link
 * RunActionRqDto} and an attribute map; the servlet-flavoured accessors return empty. The
 * static-bundle exporter ({@code MateuBundleExporter}) uses it to render a route with no server.
 */
public class HeadlessHttpRequest implements HttpRequest {

  private final RunActionRqDto rq;
  private final Map<String, Object> attributes = new HashMap<>();

  public HeadlessHttpRequest(RunActionRqDto rq) {
    this.rq = rq;
  }

  public HeadlessHttpRequest withAttribute(String key, Object value) {
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
