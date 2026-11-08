package io.mateu;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import io.helidon.http.HeaderName;
import io.helidon.http.HttpPrologue;
import io.helidon.http.Method;
import io.helidon.http.ServerRequestHeaders;
import io.helidon.http.Status;
import io.helidon.webserver.http.ServerRequest;
import io.helidon.webserver.http.ServerResponse;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.lang.reflect.Proxy;
import java.util.HashMap;
import java.util.Map;
import java.util.zip.GZIPInputStream;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

/**
 * Helidon's static handler does not compress, so {@code MateuHelidonRoutes.servesGzippedAsset}
 * answers a Mateu text asset gzipped itself — with its ETag/Last-Modified, a 304 to an unchanged
 * revalidation and a body-less HEAD — and leaves everything else to the static handler.
 */
class GzippedAssetRouteTest {

  private static final String LARGE = "/assets/large.js";

  @AfterEach
  void clearSetting() {
    System.clearProperty(io.mateu.core.infra.AssetCompression.ENABLED_PROPERTY);
  }

  /** What the route did to the response. */
  private static final class Sent {
    final Map<String, String> headers = new HashMap<>();
    Status status;
    byte[] body;
    boolean sent;
  }

  private static ServerRequest request(String method, Map<String, String> headers) {
    var prologue =
        HttpPrologue.create("HTTP/1.1", "HTTP", "1.1", Method.create(method), LARGE, false);
    var requestHeaders =
        (ServerRequestHeaders)
            Proxy.newProxyInstance(
                ServerRequestHeaders.class.getClassLoader(),
                new Class<?>[] {ServerRequestHeaders.class},
                (proxy, m, args) -> {
                  if ("first".equals(m.getName()) && args.length == 1) {
                    var name = ((HeaderName) args[0]).defaultCase();
                    return headers.entrySet().stream()
                        .filter(e -> e.getKey().equalsIgnoreCase(name))
                        .map(Map.Entry::getValue)
                        .findFirst();
                  }
                  return m.getReturnType() == boolean.class ? false : null;
                });
    return (ServerRequest)
        Proxy.newProxyInstance(
            ServerRequest.class.getClassLoader(),
            new Class<?>[] {ServerRequest.class},
            (proxy, m, args) ->
                switch (m.getName()) {
                  case "prologue" -> prologue;
                  case "headers" -> requestHeaders;
                  default -> m.getReturnType() == boolean.class ? false : null;
                });
  }

  private static ServerResponse response(Sent sent) {
    return (ServerResponse)
        Proxy.newProxyInstance(
            ServerResponse.class.getClassLoader(),
            new Class<?>[] {ServerResponse.class},
            (proxy, m, args) -> {
              switch (m.getName()) {
                case "header" -> {
                  if (args.length == 2 && args[0] instanceof String n) {
                    var v = args[1];
                    sent.headers.put(
                        n, v instanceof String[] values ? String.join(",", values) : (String) v);
                  }
                  return proxy;
                }
                case "status" -> {
                  sent.status = (Status) args[0];
                  return proxy;
                }
                case "send" -> {
                  sent.sent = true;
                  if (args != null && args.length == 1 && args[0] instanceof byte[] b) {
                    sent.body = b;
                  }
                  return null;
                }
                default -> {
                  return m.getReturnType() == boolean.class ? false : null;
                }
              }
            });
  }

  private static boolean serve(String method, Map<String, String> headers, String path, Sent sent) {
    return MateuHelidonRoutes.servesGzippedAsset(request(method, headers), response(sent), path);
  }

  private static byte[] gunzip(byte[] gz) throws IOException {
    try (var in = new GZIPInputStream(new ByteArrayInputStream(gz))) {
      var out = new ByteArrayOutputStream();
      in.transferTo(out);
      return out.toByteArray();
    }
  }

  @Test
  void aGetAcceptingGzipIsAnsweredCompressedWithItsValidators() throws Exception {
    var sent = new Sent();
    assertTrue(serve("GET", Map.of("Accept-Encoding", "gzip"), LARGE, sent));
    assertEquals("gzip", sent.headers.get("Content-Encoding"));
    assertNotNull(sent.headers.get("ETag"));
    assertNotNull(sent.body);
    var original =
        GzippedAssetRouteTest.class.getResourceAsStream("/static" + LARGE).readAllBytes();
    assertArrayEquals(original, gunzip(sent.body));
  }

  @Test
  void anUnchangedRevalidationIsA304AndAHeadHasNoBody() {
    var first = new Sent();
    serve("GET", Map.of("Accept-Encoding", "gzip"), LARGE, first);
    var etag = first.headers.get("ETag");

    var revalidation = new Sent();
    assertTrue(
        serve(
            "GET", Map.of("Accept-Encoding", "gzip", "If-None-Match", etag), LARGE, revalidation));
    assertEquals(Status.NOT_MODIFIED_304, revalidation.status);
    assertNull(revalidation.body);

    var head = new Sent();
    assertTrue(serve("HEAD", Map.of("Accept-Encoding", "gzip"), LARGE, head));
    assertTrue(head.sent);
    assertNull(head.body);
    assertNotNull(head.headers.get("Content-Length"));
  }

  @Test
  void everythingElseGoesOnToTheStaticHandler() {
    var gzip = Map.of("Accept-Encoding", "gzip");
    assertFalse(serve("POST", gzip, LARGE, new Sent()), "not a read");
    assertFalse(serve("GET", Map.of(), LARGE, new Sent()), "no gzip accepted");
    assertFalse(serve("GET", gzip, "/assets/logo.png", new Sent()), "not text");
    assertFalse(serve("GET", gzip, "/assets/missing.js", new Sent()), "not on the classpath");
    assertFalse(serve("GET", gzip, "/assets/fixed.js", new Sent()), "too small to be worth it");
    System.setProperty(io.mateu.core.infra.AssetCompression.ENABLED_PROPERTY, "false");
    assertFalse(serve("GET", gzip, LARGE, new Sent()), "compression switched off");
  }
}
