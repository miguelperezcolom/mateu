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
  void anAbsentParameterReadsAsAnEmptyList() {
    var request = new MockHttpServletRequest("GET", "/app");
    request.addParameter("tag", "a", "b");
    var httpRequest = new SpringHttpRequest(request);
    assertThat(httpRequest.getParameterValues("tag")).containsExactly("a", "b");
    assertThat(httpRequest.getParameterValues("absent")).isEmpty();
  }
}
