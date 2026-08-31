package io.mateu.core.application.runaction;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.application.ResolvedRoute;
import io.mateu.uidl.data.RouteEntry;
import java.util.Map;
import org.junit.jupiter.api.Test;

/**
 * How a route's parameters reach the view's state, and in what order they win:
 *
 * <pre>fixed  &gt;  client state  &gt;  path  &gt;  query  &gt;  defaults</pre>
 *
 * <p>The two ends are the ones that carry meaning. <b>Defaults</b> only fill what nobody supplied,
 * so a route can seed a screen without taking the choice away from the user. <b>Fixed</b> ones are
 * re-applied on the server over everything, including the component state the client sends back —
 * because resolution also runs in the browser (a statically deployed mount has no server to ask),
 * and a parameter pinned only there would be a suggestion, not a constraint.
 */
class RouteParamPrecedenceTest {

  private static Map<String, Object> resolve(
      Map<String, Object> clientState, String pattern, String route, RouteEntry entry) {
    return RouteSegmentUtils.addParameterValues(
        clientState, route, new ResolvedRoute(route, pattern, Object.class, entry), null);
  }

  @Test
  void aDefaultOnlyFillsWhatNobodyElseSupplied() {
    var entry = new RouteEntry("tickets", null, "X", null, Map.of("status", "open", "page", 1));

    var state = resolve(Map.of("status", "closed"), "tickets", "tickets", entry);

    assertThat(state).containsEntry("status", "closed"); // the client chose
    assertThat(state).containsEntry("page", 1); // nobody did, so the default stands
  }

  @Test
  void aFixedParameterOverridesTheStateTheClientSendsBack() {
    // The security-relevant case: a doctored component state must not widen a pinned scope.
    var entry = new RouteEntry("tickets/open", null, "X", Map.of("status", "open"), null);

    var state = resolve(Map.of("status", "all"), "tickets/open", "tickets/open", entry);

    assertThat(state).containsEntry("status", "open");
  }

  @Test
  void aFixedParameterOverridesAPathParameterOfTheSameName() {
    var entry = new RouteEntry("tickets/:status", null, "X", Map.of("status", "open"), null);

    var state = resolve(Map.of(), "tickets/:status", "tickets/all", entry);

    assertThat(state).containsEntry("status", "open");
  }

  @Test
  void pathParametersStillReachTheStateAlongsideTheEntrysOwn() {
    var entry = new RouteEntry("tickets/:id", null, "X", Map.of("status", "open"), null);

    var state = resolve(Map.of(), "tickets/:id", "tickets/42", entry);

    assertThat(state).containsEntry("id", "42");
    assertThat(state).containsEntry("status", "open");
  }

  @Test
  void aRouteResolvedFromAnAnnotationBehavesExactlyAsBefore() {
    // No entry: the existing path-parameter behaviour, untouched.
    var state =
        RouteSegmentUtils.addParameterValues(
            Map.of(),
            "tickets/42",
            new ResolvedRoute("tickets/42", "tickets/:id", Object.class),
            null);

    assertThat(state).containsExactly(Map.entry("id", "42"));
  }
}
