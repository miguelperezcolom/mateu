package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.application.runaction.RunActionCommand;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.MateuInstanceFactory;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Final tails: the remaining RouteAnnotationMatcher entry points, record-component coercion of
 * temporals / enum option-maps / nested object arrays, and the EditableView save auto-clean
 * command.
 */
class FinalPushTest {

  // ── record coercion tails (ConstructorResolver → ReflectionTypeCoercer) ─────

  @SuppressWarnings("unused")
  public enum Mood {
    HAPPY,
    SAD
  }

  public record Meta(String key, String value) {}

  public record Event(
      String name, LocalDate day, LocalDateTime at, Mood mood, Meta[] metas, Class<?> handler) {}

  // ── editable view auto-clean ────────────────────────────────────────────────

  @SuppressWarnings("unused")
  @UI("/profile2")
  public static class Profile2View
      extends io.mateu.core.infra.declarative.orchestrators.editableview.AutoEditableView<
          DeepFlowsSyncTest.Profile> {
    static DeepFlowsSyncTest.Profile HELD = new DeepFlowsSyncTest.Profile();

    @Override
    public DeepFlowsSyncTest.Profile load(io.mateu.uidl.interfaces.HttpRequest httpRequest) {
      return HELD;
    }

    @Override
    public void persist(
        DeepFlowsSyncTest.Profile entity, io.mateu.uidl.interfaces.HttpRequest httpRequest) {
      HELD = entity;
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(Profile2View.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  // ── RouteAnnotationMatcher remaining entry points ───────────────────────────

  @SuppressWarnings("unused")
  static class ShopSection {
    String name = "s";
  }

  @UI("/shop")
  static class ShopApp {
    @io.mateu.uidl.annotations.Menu ShopSection section = new ShopSection();
  }

  @Route("/aisle")
  static class Aisle {}

  private static RunActionCommand command(String route, String consumedRoute) {
    return new RunActionCommand(
        "", "", route, consumedRoute, "", Map.of(), Map.of(), null, null, null, null);
  }

  @Test
  void matchesAppAcceptsTheAppRoute() {
    // matchesApp only fires for classes that ARE apps (menu-carrying)
    assertThat(
            io.mateu.core.application.RouteAnnotationMatcher.matchesApp(
                "/shop", ShopApp.class, command("/shop", "_empty")))
        .isPresent();
  }

  @Test
  void matchesAppRejectsOtherRoots() {
    assertThat(
            io.mateu.core.application.RouteAnnotationMatcher.matchesApp(
                "/other", ShopApp.class, command("/other", "_empty")))
        .isEmpty();
  }

  @Test
  void plainMatchesResolvesRouteAnnotations() {
    assertThat(
            io.mateu.core.application.RouteAnnotationMatcher.matches(
                "/aisle", Aisle.class, command("/aisle", "_empty")))
        .isPresent();
    assertThat(
            io.mateu.core.application.RouteAnnotationMatcher.matches(
                "/nope", Aisle.class, command("/nope", "_empty")))
        .isEmpty();
  }

  // ── record component coercion ───────────────────────────────────────────────

  @Test
  void temporalRecordComponentsParseFromStrings() {
    var event =
        MateuInstanceFactory.newInstance(
            Event.class,
            Map.of("name", "Launch", "day", "2026-07-05", "at", "2026-07-05T09:00:00"),
            null);
    assertThat(event.day()).isEqualTo(LocalDate.of(2026, 7, 5));
    assertThat(event.at()).isEqualTo(LocalDateTime.of(2026, 7, 5, 9, 0));
  }

  @Test
  void emptyTemporalStringsBecomeNullInRecords() {
    var data = new HashMap<String, Object>();
    data.put("name", "x");
    data.put("day", "");
    data.put("at", "");
    var event = MateuInstanceFactory.newInstance(Event.class, data, null);
    assertThat(event.day()).isNull();
    assertThat(event.at()).isNull();
  }

  @Test
  void enumOptionMapsCoerceInRecordComponents() {
    var event =
        MateuInstanceFactory.newInstance(
            Event.class, Map.of("name", "x", "mood", Map.of("value", "SAD")), null);
    assertThat(event.mood()).isEqualTo(Mood.SAD);
  }

  @Test
  void nestedObjectArraysBuildInRecordComponents() {
    var event =
        MateuInstanceFactory.newInstance(
            Event.class,
            Map.of(
                "name",
                "x",
                "metas",
                List.of(Map.of("key", "a", "value", "1"), Map.of("key", "b", "value", "2"))),
            null);
    assertThat(event.metas()).hasSize(2);
    assertThat(event.metas()[0].key()).isEqualTo("a");
    assertThat(event.metas()[1].value()).isEqualTo("2");
  }

  @Test
  void classRecordComponentsResolveFromNames() {
    var event =
        MateuInstanceFactory.newInstance(
            Event.class, Map.of("name", "x", "handler", "java.lang.Thread"), null);
    assertThat(event.handler()).isEqualTo(Thread.class);
  }

  // ── editable view auto-clean on save ────────────────────────────────────────

  @Test
  void saveLandingOnViewAppendsMarkAsClean() {
    Profile2View.HELD = new DeepFlowsSyncTest.Profile();
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/profile2/edit")
                .consumedRoute("/profile2")
                .serverSideType(Profile2View.class.getName())
                .actionId("save")
                .componentState(Map.of("name", "Eva", "email", "e@x.y"))
                .initiatorComponentId("p2_app")
                .build());
    assertThat(increment.commands())
        .anySatisfy(command -> assertThat(command.type().name()).isEqualTo("MarkAsClean"));
  }
}
