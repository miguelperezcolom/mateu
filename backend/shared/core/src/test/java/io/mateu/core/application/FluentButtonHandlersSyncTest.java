package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.ActionDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.Card;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.data.State;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * A fluent {@link Button} built with a handler ({@code new Button("Increment", () -> ...)}) runs
 * that handler on the server — {@code ComponentTreeActionRunner} finds the button by id in the
 * tree. The web client only SENDS an action its component advertises, so the view must advertise
 * the id of every handler-backed button, whether or not a METHOD of that name exists. The counter
 * of demo.mateu.io has a package-private {@code increment()} — not an action method — so since the
 * tree-action harvester advertised only ids with an invocable method, the click was dropped in the
 * browser ("no component on the page handles it") although the server would have run it.
 */
class FluentButtonHandlersSyncTest {

  /** The demo-vaadin-webflux counter, verbatim. */
  @UI("/fluent-counter")
  public static class Counter implements ComponentTreeSupplier {

    int count = 0;

    Counter increment() {
      count++;
      return this;
    }

    @Override
    public Component component(HttpRequest httpRequest) {
      return new VerticalLayout(
          new Text("${state.count}"), new Button("Increment", () -> new State(increment())));
    }
  }

  static int pings;

  /** Handler buttons nested in a Card, a Runnable one, and one that only names an action. */
  @UI("/fluent-handlers")
  public static class Handlers implements ComponentTreeSupplier {

    int count = 0;

    @Override
    public Component component(HttpRequest httpRequest) {
      return new VerticalLayout(
          Card.builder()
              .content(
                  new HorizontalLayout(
                      new Button(
                          "Add two",
                          () -> {
                            count += 2;
                            return new State(this);
                          }),
                      new Button("Ping", (Runnable) () -> pings++)))
              .build(),
          new Button("Plain", "plainAction"));
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(Counter.class, Handlers.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static ServerSideComponentDto component(UIIncrementDto increment) {
    return (ServerSideComponentDto) increment.fragments().get(0).component();
  }

  private static List<String> advertised(UIIncrementDto increment) {
    return component(increment).actions().stream().map(ActionDto::id).toList();
  }

  @SuppressWarnings("unchecked")
  private static Object stateValue(UIIncrementDto increment, String key) {
    var fragment = increment.fragments().get(0);
    Object state = fragment.state();
    if (state == null && fragment.component() instanceof ServerSideComponentDto ssc) {
      state = ssc.initialData();
    }
    return ((Map<String, Object>) state).get(key);
  }

  private static UIIncrementDto run(String route, String actionId, Map<String, Object> state) {
    var type = component(mateu.sync(route)).serverSideType();
    return mateu.run(
        RunActionRqDto.builder()
            .route(route)
            .actionId(actionId)
            .serverSideType(type)
            .componentState(state)
            .build());
  }

  @Test
  void theCounterAdvertisesItsHandlerButton() {
    assertThat(advertised(mateu.sync("/fluent-counter"))).contains("increment");
  }

  @Test
  void runningTheHandlerButtonIncrementsTheCount() {
    var result = run("/fluent-counter", "increment", Map.of("count", 0));
    assertThat(stateValue(result, "count")).isEqualTo(1);
  }

  @Test
  void nestedAndRunnableHandlerButtonsAreAdvertisedOnceEach() {
    var ids = advertised(mateu.sync("/fluent-handlers"));
    assertThat(ids).contains("addTwo", "ping");
    // a button that only NAMES an action has no handler here: maybe an ancestor's, not captured
    assertThat(ids).doesNotContain("plainAction");
    assertThat(ids).doesNotHaveDuplicates();
  }

  @Test
  void aHandlerButtonInsideACardRuns() {
    // the runner used to walk only ContentSupplier layouts and Form header/footer: a button in a
    // Card's content was advertised by nobody and found by nobody
    var result = run("/fluent-handlers", "addTwo", Map.of("count", 3));
    assertThat(stateValue(result, "count")).isEqualTo(5);
  }

  @Test
  void aRunnableHandlerButtonRuns() {
    int before = pings;
    run("/fluent-handlers", "ping", Map.of("count", 0));
    assertThat(pings).isEqualTo(before + 1);
  }
}
