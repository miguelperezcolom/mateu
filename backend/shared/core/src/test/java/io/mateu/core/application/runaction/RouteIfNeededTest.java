package io.mateu.core.application.runaction;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.RouteHandler;
import java.util.Map;
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Mono;

/** An instance that arrives wrapped in a Mono is unwrapped (and routed), not emitted as a Mono. */
class RouteIfNeededTest {

  static final Object ROUTED = new Object();

  static class Router implements RouteHandler {
    @Override
    public Object handleRoute(String route, HttpRequest httpRequest) {
      return ROUTED;
    }
  }

  private static RunActionCommand command() {
    return new RunActionCommand("", "", "/x", "", "", Map.of(), Map.of(), null, null, null, null);
  }

  @Test
  void aMonoInstanceIsUnwrapped() {
    var plain = new Object();
    assertThat(RunActionUseCase.routeIfNeeded(command(), Mono.just(plain)).block()).isSameAs(plain);
  }

  @Test
  void aMonoOfARouteHandlerIsRouted() {
    assertThat(RunActionUseCase.routeIfNeeded(command(), Mono.just(new Router())).block())
        .isSameAs(ROUTED);
  }
}
