package io.mateu;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

/**
 * The Spring MVC {@link SpringHttpRequest}: the server's own base url — what a relative {@code
 * RemoteMenu} is resolved against — comes from the local socket, never from the {@code Host} header
 * the client sets; and an absent parameter reads as nothing rather than throwing.
 */
class SpringHttpRequestTest {

  @Test
  void theSelfBaseUrlIsTheLocalSocketOverPlainHttpOnly() {
    var plain = new MockHttpServletRequest("GET", "/app");
    plain.addHeader("Host", "attacker.example");
    plain.setServerName("attacker.example");
    plain.setLocalPort(8123);
    assertThat(new SpringHttpRequest(plain).getSelfBaseUrl()).isEqualTo("http://localhost:8123");

    var tls = new MockHttpServletRequest("GET", "/app");
    tls.setLocalPort(8443);
    tls.setSecure(true);
    assertThat(new SpringHttpRequest(tls).getSelfBaseUrl()).isNull();

    var unknownSocket = new MockHttpServletRequest("GET", "/app");
    unknownSocket.setLocalPort(0);
    assertThat(new SpringHttpRequest(unknownSocket).getSelfBaseUrl()).isNull();
  }

  @Test
  void whatTheRequestSaidSurvivesTheRequest() {
    var servlet = new MockHttpServletRequest("POST", "/app");
    servlet.setServletPath("/app/mateu/v3/sse/x");
    servlet.addHeader("X-Echo", "hola");
    servlet.addParameter("q", "1");
    servlet.setAttribute("set.by.a.filter", "yes");
    servlet.setRemoteAddr("10.0.0.1");
    var principal = (java.security.Principal) () -> "ada";
    servlet.setUserPrincipal(principal);
    var httpRequest = new SpringHttpRequest(servlet);
    httpRequest.setAttribute("mateu.callerIdentity", "cached");

    // the container finished the request and reuses the object for somebody else's
    servlet.clearAttributes();
    servlet.removeHeader("X-Echo");
    servlet.addHeader("X-Echo", "another user");
    servlet.removeAllParameters();
    servlet.setUserPrincipal(null);
    servlet.setRemoteAddr("10.0.0.2");
    servlet.setServletPath("/other");

    assertThat(httpRequest.getUserPrincipal()).isSameAs(principal);
    assertThat(httpRequest.getAttribute("mateu.callerIdentity")).isEqualTo("cached");
    assertThat(httpRequest.getAttribute("set.by.a.filter")).isEqualTo("yes");
    assertThat(httpRequest.getHeaderValue("x-echo")).isEqualTo("hola");
    assertThat(httpRequest.getHeaderValues("X-ECHO")).containsExactly("hola");
    assertThat(httpRequest.getParameterValue("q")).isEqualTo("1");
    assertThat(httpRequest.getParameterNames()).containsExactly("q");
    assertThat(httpRequest.getRemoteAddress()).isEqualTo("10.0.0.1");
    assertThat(httpRequest.path()).isEqualTo("/app/mateu/v3/sse/x");
  }

  @Test
  void anAbsentParameterReadsAsAnEmptyList() {
    var request = new MockHttpServletRequest("GET", "/app");
    request.addParameter("tag", "a", "b");
    var httpRequest = new SpringHttpRequest(request);
    assertThat(httpRequest.getParameterValues("tag")).containsExactly("a", "b");
    assertThat(httpRequest.getParameterValues("absent")).isEmpty();
  }
}
