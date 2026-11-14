package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.mateu.core.application.security.MateuForbiddenException;
import io.mateu.core.testutil.SpecsDir;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import java.nio.file.Path;
import java.util.Map;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

/**
 * GA round-2 Java findings that are still OPEN on rc.1 (5bbce1a3f3): each test reproduces the
 * review's scenario (or the nearest shape the fix missed) and FAILS today. Disabled so the build
 * stays green; remove the {@code @Disabled} when the fix lands. Every test boots its own harness
 * (MateuBeanProvider is a static holder: one harness per JVM at a time).
 */
class Rc1ReverifyOpenFindingsTest {

  private static final ObjectMapper JSON =
      new ObjectMapper()
          .registerModule(new JavaTimeModule())
          .disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);

  @TempDir Path dir;

  private static String load(
      Class<?> type, String route, String action, Map<String, Object> state) {
    try (var mateu = TestMateu.withUis(type)) {
      return JSON.valueToTree(
              mateu.run(
                  RunActionRqDto.builder()
                      .route(route)
                      .consumedRoute(route)
                      .serverSideType(type.getName())
                      .actionId(action)
                      .initiatorComponentId("c1")
                      .componentState(state)
                      .parameters(Map.of())
                      .build(),
                  Map.of()))
          .toString();
    }
  }

  public static class PageVm {
    public String x = "vm";
  }

  /**
   * J1 (PARTIAL): an UNRESTRICTED authored route without a {@code layout:} (here {@code
   * pages/:name} bound to a view model) matches {@code /pages/user}, so {@code
   * refusingByDefinition} stands down ({@code table.match(path).isPresent()}) while {@code
   * parseSpec} still serves {@code specs/ui/pages/user.yaml} by convention — the layout of the
   * restricted {@code backoffice/users/:id}. Anonymous load renders USER-PAGE.
   */
  @Test
  @Disabled(
      "rc.2: J1 — a matched entry with no layout still serves a restricted layout by convention")
  void j1_anUnrestrictedParameterisedRouteWithNoLayoutDoesNotServeARestrictedLayoutFile() {
    var root =
        SpecsDir.write(
            dir,
            Map.of(
                "routes.yaml",
                """
                type: Routes
                routes:
                  - route: backoffice/users/:id
                    layout: pages/user.yaml
                    access: admin
                  - route: pages/:name
                    viewModel: %s
                """
                    .formatted(PageVm.class.getName()),
                "pages/user.yaml",
                Rc1ReverifyYamlRoutesSyncTest.page("USER-PAGE")));
    var rq = RunActionRqDto.builder().route("/pages/user").actionId("").build();
    var out =
        SpecsDir.over(
            root,
            cl -> {
              try (var m = TestMateu.withUis(PageVm.class)) {
                try {
                  return JSON.valueToTree(m.run(rq, Map.of())).toString();
                } catch (MateuForbiddenException e) {
                  return "FORBIDDEN";
                }
              }
            });
    assertThat(out).doesNotContain("USER-PAGE");
  }

  /**
   * J3 (PARTIAL): writes into held beans are closed, but a {@code final} field of a CONCRETE type
   * (a {@code @Service} class held by constructor injection — the documented idiom) exposed by a
   * view getter (Lombok {@code @Getter}/{@code @Data}) still travels in the state: {@code
   * "service":{"endpoint":"https://real-endpoint-123"}}. {@code
   * FormViewSerializer.isHeldDependency} only drops interface/abstract-typed final fields.
   */
  @Test
  @Disabled("rc.2: J3 — a final concrete bean behind a view getter is sent in the state")
  void j3_aFinalConcreteBeanExposedByAGetterIsNotSentInTheState() {
    var out =
        load(Rc1ReverifyJavaSyncTest.ConcreteHoldingView.class, "/rc1-held-concrete", "", Map.of());
    assertThat(out).doesNotContain("real-endpoint-123");
  }

  /**
   * J5 (PARTIAL): Map/array/Optional/subclass are walked now, but an {@code @EyesOnly} value still
   * reaches the state through {@code Map<String, List<Pay>>}, {@code List<List<Pay>>}, an {@code
   * Object}-typed field holding a {@code Pay}, and the FLATTENED keys of a record holding a {@code
   * Pay} ({@code record-pay}, {@code anything-secretNote}).
   */
  @Test
  @Disabled(
      "rc.2: J5 — nested collections, Object fields and flattened keys carry @EyesOnly values")
  void j5_moreShapesDoNotCarryTheHiddenValue() {
    var out = load(Rc1ReverifyJavaSyncTest.MoreShapes.class, "/rc1-shapes", "", Map.of());
    assertThat(out).contains("\"note\":\"n\"").doesNotContain("\"top\"");
  }

  /**
   * J6 (NOT FIXED, minor): {@code CrudStore.find}'s default text match reads every plain field
   * ({@code plainValuesOf}), so an anonymous caller searching the {@code @EyesOnly} value "BAND-Z9"
   * gets the row back — an oracle over a column they may not read.
   */
  @Test
  @Disabled("rc.2: J6 — free-text search matches values of columns the caller may not read")
  void j6_freeTextSearchDoesNotMatchAColumnTheCallerMayNotRead() {
    Rc1ReverifyJavaSyncTest.SECRETIVE.clear();
    Rc1ReverifyJavaSyncTest.SECRETIVE.add(new Rc1ReverifyJavaSyncTest.Secretive("s1", "Ana"));
    var none =
        load(
            Rc1ReverifyJavaSyncTest.SecretiveCrud.class,
            "/rc1-secretive",
            "search",
            Map.of("searchText", "qqq-nothing"));
    assertThat(none).doesNotContain("Ana"); // the box does filter
    var rows =
        load(
            Rc1ReverifyJavaSyncTest.SecretiveCrud.class,
            "/rc1-secretive",
            "search",
            Map.of("searchText", "BAND-Z9"));
    assertThat(rows).doesNotContain("Ana");
  }
}
