package io.mateu.test;

import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.interfaces.HttpRequest;
import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/** The request the harness hands the core: what an adapter builds from an HTTP call. */
final class HarnessRequest implements HttpRequest {

  private final Map<String, Object> attributes = new HashMap<>();
  private final Map<String, String> headers;
  private final Principal principal;
  private final String path;

  HarnessRequest(
      RunActionRqDto rq,
      String baseUrl,
      String path,
      Principal principal,
      Map<String, String> headers) {
    this.principal = principal;
    this.path = path;
    this.headers = new HashMap<>(headers);
    attributes.put("baseUrl", baseUrl);
    storeRunActionRqDto(rq);
  }

  @Override
  public Principal getUserPrincipal() {
    return principal;
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
    for (var entry : headers.entrySet()) {
      if (entry.getKey().equalsIgnoreCase(key)) {
        return entry.getValue();
      }
    }
    return null;
  }

  @Override
  public List<String> getHeaderValues(String key) {
    var value = getHeaderValue(key);
    return value == null ? List.of() : List.of(value);
  }

  @Override
  public String path() {
    return path;
  }

  @Override
  public List<String> getParameterNames() {
    return List.of();
  }
}
