package io.mateu;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.nullValue;

import java.lang.reflect.Proxy;
import java.net.InetSocketAddress;
import org.junit.jupiter.api.Test;

/**
 * The caller's address {@link MicronautHttpRequest#getRemoteAddress()} reports (what the live UI
 * push channel keys its per-owner limits on): the peer's IP, or nothing when the socket is unknown
 * or its host was never resolved.
 */
class MicronautHttpRequestTest {

  @Test
  void theRemoteAddressIsThePeersIp() {
    assertThat(
        requestFrom(new InetSocketAddress("192.168.1.7", 54321)).getRemoteAddress(),
        is("192.168.1.7"));
  }

  @Test
  void anUnknownSocketIsNoAddress() {
    assertThat(requestFrom(null).getRemoteAddress(), nullValue());
  }

  @Test
  void anUnresolvedHostIsNoAddress() {
    assertThat(
        requestFrom(InetSocketAddress.createUnresolved("peer.invalid", 54321)).getRemoteAddress(),
        nullValue());
  }

  private static MicronautHttpRequest requestFrom(InetSocketAddress remote) {
    var delegate =
        (io.micronaut.http.HttpRequest<?>)
            Proxy.newProxyInstance(
                MicronautHttpRequestTest.class.getClassLoader(),
                new Class<?>[] {io.micronaut.http.HttpRequest.class},
                (proxy, method, args) ->
                    method.getName().equals("getRemoteAddress") ? remote : null);
    return new MicronautHttpRequest(delegate);
  }
}
