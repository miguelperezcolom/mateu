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
  private final Map<String, String> headers = new HashMap<>();

  public FakeHttpRequest(RunActionRqDto rq) {
    this.rq = rq;
  }

  public FakeHttpRequest withAttribute(String key, Object value) {
    attributes.put(key, value);
    return this;
  }

  public FakeHttpRequest withHeader(String key, String value) {
    headers.put(key, value);
    return this;
  }

  private java.security.Principal principal;

  /** The principal the (simulated) framework authenticated. */
  public FakeHttpRequest withPrincipal(java.security.Principal principal) {
    this.principal = principal;
    return this;
  }

  /**
   * The principal set with {@link #withPrincipal}, else the one {@link TestIdentities#ROLES_HEADER}
   * describes — the test stand-in for what an adapter reads off its framework's security context.
   */
  @Override
  public java.security.Principal getUserPrincipal() {
    if (principal != null) {
      return principal;
    }
    var roles = headers.get(TestIdentities.ROLES_HEADER);
    return roles == null ? null : TestIdentities.principalWithRoles(roles.split(","));
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
    return headers.get(key);
  }

  /** What an adapter knows of its local socket: a relative remote menu resolves against it. */
  public static final String SELF_BASE_URL = "http://localhost:8080";

  @Override
  public String getSelfBaseUrl() {
    return SELF_BASE_URL;
  }

  @Override
  public List<String> getHeaderValues(String key) {
    var value = headers.get(key);
    return value == null ? List.of() : List.of(value);
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
