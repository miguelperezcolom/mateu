package io.mateu;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.net.SocketAddress;
import java.lang.reflect.Proxy;
import org.junit.jupiter.api.Test;

/**
 * The caller's address {@link QuarkusHttpRequest#getRemoteAddress()} reports (what the live UI push
 * channel keys its per-owner limits on): the peer's IP, or nothing when the socket is unknown.
 */
class QuarkusHttpRequestTest {

  @Test
  void theRemoteAddressIsThePeersIp() {
    assertEquals(
        "192.168.1.7",
        requestFrom(SocketAddress.inetSocketAddress(54321, "192.168.1.7")).getRemoteAddress());
  }

  @Test
  void anUnknownSocketIsNoAddress() {
    assertNull(requestFrom(null).getRemoteAddress());
  }

  private static QuarkusHttpRequest requestFrom(SocketAddress remote) {
    var delegate =
        (HttpServerRequest)
            Proxy.newProxyInstance(
                QuarkusHttpRequestTest.class.getClassLoader(),
                new Class<?>[] {HttpServerRequest.class},
                (proxy, method, args) -> method.getName().equals("remoteAddress") ? remote : null);
    return new QuarkusHttpRequest(delegate);
  }
}
