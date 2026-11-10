package io.mateu;

import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.concurrent.ConcurrentHashMap;

/**
 * What the servlet request said, copied when this is built, on the container's thread: a streamed
 * action outlives the request (a {@code LongTask} that goes on after its tab closes), and by then
 * the container has recycled it — possibly for somebody else's request — and Spring Security's
 * principal, read off a thread-local, is not there on the stream's thread. The other adapters
 * already keep their own copy.
 */
public class SpringHttpRequest implements HttpRequest {

  private final Map<String, Object> attributes = new ConcurrentHashMap<>();
  private final Map<String, List<String>> headers = new TreeMap<>(String.CASE_INSENSITIVE_ORDER);
  private final Map<String, String[]> parameters;
  private final java.security.Principal principal;
  private final String remoteAddress;
  private final String selfBaseUrl;
  private final String path;

  public SpringHttpRequest(HttpServletRequest delegate) {
    var attributeNames = delegate.getAttributeNames();
    while (attributeNames != null && attributeNames.hasMoreElements()) {
      var name = attributeNames.nextElement();
      var value = delegate.getAttribute(name);
      if (value != null) {
        attributes.put(name, value);
      }
    }
    var headerNames = delegate.getHeaderNames();
    while (headerNames != null && headerNames.hasMoreElements()) {
      var name = headerNames.nextElement();
      headers.put(name, Collections.list(delegate.getHeaders(name)));
    }
    parameters = Map.copyOf(delegate.getParameterMap());
    // Spring Security's servlet wrapper answers the Authentication (null for an anonymous caller)
    principal = delegate.getUserPrincipal();
    remoteAddress = delegate.getRemoteAddr();
    // the LOCAL socket this request arrived on — not the Host header, which the client sets
    selfBaseUrl =
        delegate.isSecure() || delegate.getLocalPort() <= 0
            ? null
            : "http://localhost:" + delegate.getLocalPort();
    path = delegate.getServletPath();
  }

  @Override
  public String getParameterValue(String name) {
    var values = parameters.get(name);
    return values != null && values.length > 0 ? values[0] : null;
  }

  @Override
  public List<String> getParameterValues(String name) {
    var values = parameters.get(name);
    return values != null ? List.of(values) : List.of();
  }

  @Override
  public Object getAttribute(String key) {
    return attributes.get(key);
  }

  @Override
  public void setAttribute(String key, Object value) {
    if (value == null) {
      attributes.remove(key);
    } else {
      attributes.put(key, value);
    }
  }

  @Override
  public java.security.Principal getUserPrincipal() {
    return principal;
  }

  @Override
  public String getRemoteAddress() {
    return remoteAddress;
  }

  @Override
  public String getHeaderValue(String key) {
    var values = headers.get(key);
    return values != null && !values.isEmpty() ? values.get(0) : null;
  }

  @Override
  public List<String> getHeaderValues(String key) {
    return headers.getOrDefault(key, List.of());
  }

  @Override
  public String getSelfBaseUrl() {
    return selfBaseUrl;
  }

  @Override
  public String path() {
    return path;
  }

  @Override
  public List<String> getParameterNames() {
    return List.copyOf(parameters.keySet());
  }
}
