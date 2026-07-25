package io.mateu;

import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.ws.rs.core.HttpHeaders;
import jakarta.ws.rs.core.MultivaluedMap;
import jakarta.ws.rs.core.UriInfo;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * {@link HttpRequest} backed by the JAX-RS context objects Helidon MP (Jersey) exposes to a
 * resource method via {@code @Context}. Using {@link HttpHeaders} + {@link UriInfo} keeps the
 * adapter portable (no dependency on Helidon's internal ServerRequest) and gives real access to
 * headers (e.g. the Authorization bearer token) and query parameters.
 */
public class HelidonMPHttpRequest implements HttpRequest {

  private final HttpHeaders headers;
  private final UriInfo uriInfo;
  private final Map<String, Object> attributes = new HashMap<>();

  public HelidonMPHttpRequest(HttpHeaders headers, UriInfo uriInfo) {
    this.headers = headers;
    this.uriInfo = uriInfo;
  }

  private MultivaluedMap<String, String> query() {
    return uriInfo != null ? uriInfo.getQueryParameters() : null;
  }

  @Override
  public String getParameterValue(String name) {
    var q = query();
    return q != null ? q.getFirst(name) : null;
  }

  @Override
  public List<String> getParameterValues(String name) {
    var q = query();
    var values = q != null ? q.get(name) : null;
    return values != null ? values : List.of();
  }

  @Override
  public List<String> getParameterNames() {
    var q = query();
    return q != null ? new ArrayList<>(q.keySet()) : List.of();
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
    return headers != null ? headers.getHeaderString(key) : null;
  }

  @Override
  public List<String> getHeaderValues(String key) {
    if (headers == null) return List.of();
    var values = headers.getRequestHeader(key);
    return values != null ? values : List.of();
  }

  @Override
  public String path() {
    return uriInfo != null ? uriInfo.getPath() : null;
  }
}
