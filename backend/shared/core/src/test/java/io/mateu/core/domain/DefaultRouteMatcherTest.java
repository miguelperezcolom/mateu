package io.mateu.core.domain;

import static org.junit.jupiter.api.Assertions.*;

import io.mateu.core.infra.FakeHttpRequest;
import io.mateu.uidl.interfaces.HandlesRoute;
import io.mateu.uidl.interfaces.HttpRequest;
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Mono;

class DefaultRouteMatcherTest {

  DefaultRouteMatcher defaultRouteMatcher = new DefaultRouteMatcher();

  @Test
  void returnsSelf() {
    var handlesRoutes =
        new HandlesRoute() {

          @Override
          public Mono<?> handleRoute(String route, HttpRequest httpRequest) {
            return null;
          }
        };
    var result = defaultRouteMatcher.map(handlesRoutes, new FakeHttpRequest()).block();
    assertEquals(handlesRoutes, result);
  }

  @Test
  void returnsEmpty() {
    var result = defaultRouteMatcher.map("Hola", new FakeHttpRequest()).block();
    assertNull(result);
  }
}
