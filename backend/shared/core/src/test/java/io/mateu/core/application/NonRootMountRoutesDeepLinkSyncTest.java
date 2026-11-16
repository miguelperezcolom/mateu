package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.AppDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import java.util.Map;
import java.util.function.Supplier;
import java.util.stream.Stream;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

/**
 * A FRESH deep link ({@code consumedRoute=_empty}, no type) to a routes.yaml route under a
 * CLASS-declared app mount ({@code /nrm/orders/pending}) answers the APP — its chrome, its menu —
 * and the client then loads the route inside it. On the adapters that resolve mounts through
 * pre-compiled {@code RouteResolver}s (WebFlux, Quarkus, Helidon) nothing answered the mount's root
 * segment, so the authored view model rendered alone, with no menu (e2e shell-menu.spec.ts, «only
 * the most specific menu entry is the active one»). Both shapes of provider must agree.
 */
class NonRootMountRoutesDeepLinkSyncTest {

  static Stream<Arguments> harnesses() {
    return Stream.of(
        Arguments.of(
            "routed-class providers (MVC, Micronaut)",
            (Supplier<TestMateu>) () -> TestMateu.withUis(NonRootMountRoutesSyncTest.NrmApp.class)),
        Arguments.of(
            "compiled route resolvers (WebFlux, Quarkus, Helidon)",
            (Supplier<TestMateu>)
                () ->
                    TestMateu.withCompiledRouteResolvers(NonRootMountRoutesSyncTest.NrmApp.class)));
  }

  @ParameterizedTest(name = "{0}")
  @MethodSource("harnesses")
  void aFreshDeepLinkToAnAuthoredRouteAnswersTheAppShell(String name, Supplier<TestMateu> harness) {
    try (var mateu = harness.get()) {
      UIIncrementDto increment =
          mateu.runAt(
              "/nrm",
              RunActionRqDto.builder()
                  .route("/orders/pending")
                  .consumedRoute("_empty")
                  .actionId("")
                  .initiatorComponentId("_ux")
                  .componentState(Map.of())
                  .appState(Map.of())
                  .parameters(Map.of())
                  .build());
      var component = increment.fragments().get(0).component();
      var app = FullSyncPipelineTest.findMetadata(component, AppDto.class);
      assertThat(app).as("the app shell answers the deep link").isNotNull();
      assertThat(app.serverSideType()).isEqualTo(NonRootMountRoutesSyncTest.NrmApp.class.getName());
      assertThat(app.menu()).extracting(o -> o.label()).contains("Pending orders");
      assertThat(app.homeRoute()).isEqualTo("/orders/pending");
      assertThat(app.homeServerSideType())
          .isEqualTo(NonRootMountRoutesSyncTest.Orders.class.getName());
    }
  }
}
