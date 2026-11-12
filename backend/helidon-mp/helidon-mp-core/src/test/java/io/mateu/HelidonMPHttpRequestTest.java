package io.mateu;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;

import io.helidon.common.socket.PeerInfo;
import io.helidon.webserver.http.ServerRequest;
import jakarta.ws.rs.core.HttpHeaders;
import jakarta.ws.rs.core.MultivaluedHashMap;
import jakarta.ws.rs.core.UriInfo;
import java.security.Principal;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

/** The request a Jersey-served Mateu call hands to Mateu: headers, query, caller and address. */
class HelidonMPHttpRequestTest {

  private static UriInfo uriInfo(MultivaluedHashMap<String, String> query, String path) {
    var answers = new java.util.HashMap<String, Object>();
    answers.put("getQueryParameters", query);
    answers.put("getPath", path);
    return Fakes.fake(UriInfo.class, answers);
  }

  private static HttpHeaders headers(String name, List<String> values) {
    return Fakes.fake(
        HttpHeaders.class,
        Map.of(
            "getHeaderString",
            (java.util.function.Function<Object[], Object>)
                args -> name.equalsIgnoreCase((String) args[0]) ? String.join(",", values) : null,
            "getRequestHeader",
            (java.util.function.Function<Object[], Object>)
                args -> name.equalsIgnoreCase((String) args[0]) ? values : null));
  }

  @Test
  void readsTheQueryAndTheHeadersOfTheJaxRsRequest() {
    var query = new MultivaluedHashMap<String, String>();
    query.add("page", "2");
    query.add("tag", "a");
    query.add("tag", "b");
    var request =
        new HelidonMPHttpRequest(
            headers("Authorization", List.of("Bearer x")), uriInfo(query, "hello/mateu"));

    assertEquals("2", request.getParameterValue("page"));
    assertEquals(List.of("a", "b"), request.getParameterValues("tag"));
    assertEquals(List.of(), request.getParameterValues("missing"));
    assertNull(request.getParameterValue("missing"));
    assertEquals(
        java.util.Set.of("page", "tag"), java.util.Set.copyOf(request.getParameterNames()));
    assertEquals("Bearer x", request.getHeaderValue("Authorization"));
    assertEquals(List.of("Bearer x"), request.getHeaderValues("Authorization"));
    assertEquals(List.of(), request.getHeaderValues("Cookie"));
    assertNull(request.getHeaderValue("Cookie"));
    assertEquals("hello/mateu", request.path());
  }

  @Test
  void withoutJaxRsContextEverythingIsEmptyNeverAnError() {
    var request = new HelidonMPHttpRequest(null, null);
    assertNull(request.getParameterValue("x"));
    assertEquals(List.of(), request.getParameterValues("x"));
    assertEquals(List.of(), request.getParameterNames());
    assertNull(request.getHeaderValue("x"));
    assertEquals(List.of(), request.getHeaderValues("x"));
    assertNull(request.path());
    assertNull(request.getUserPrincipal());
    assertNull(request.getRemoteAddress());
  }

  @Test
  void carriesThePrincipalJaxRsAuthenticatedAndAttributes() {
    Principal leia = () -> "leia";
    var request = new HelidonMPHttpRequest(null, null).withPrincipal(leia);
    request.setAttribute("baseUrl", "/back-office");
    assertSame(leia, request.getUserPrincipal());
    assertEquals("/back-office", request.getAttribute("baseUrl"));
    assertNull(request.getAttribute("uiId"));
  }

  @Test
  void theAddressIsTheSocketPeerNeverAForwardedHeader() {
    var peer = Fakes.fake(PeerInfo.class, Map.of("host", "10.0.0.7"));
    var serverRequest = Fakes.fake(ServerRequest.class, Map.of("remotePeer", peer));
    var request =
        new HelidonMPHttpRequest(headers("X-Forwarded-For", List.of("1.2.3.4")), null)
            .withRemoteOf(serverRequest);
    assertEquals("10.0.0.7", request.getRemoteAddress());
  }

  @Test
  void anUnknownPeerIsNoAddress() {
    assertNull(new HelidonMPHttpRequest(null, null).withRemoteOf(null).getRemoteAddress());
    var broken =
        Fakes.fake(ServerRequest.class, Map.of("remotePeer", new IllegalStateException("gone")));
    assertNull(new HelidonMPHttpRequest(null, null).withRemoteOf(broken).getRemoteAddress());
  }
}
