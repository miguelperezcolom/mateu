package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.orchestrators.calendar.CalendarPage;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.CalendarDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UICommandTypeDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.CalendarEvent;
import io.mateu.uidl.interfaces.HttpRequest;
import java.net.URI;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * CalendarPage archetype (the Redwood "Calendar" template): the calendar toolbar (previous/next
 * month, Today, optional + Create) over the month grid; month navigation re-runs the event source,
 * and clicking an event acts on it (navigates to its detail).
 */
class CalendarPageSyncTest {

  private static final List<CalendarEvent> EVENTS =
      List.of(
          CalendarEvent.builder()
              .id("e1")
              .title("Kickoff")
              .date(LocalDate.of(2026, 10, 4))
              .color("#3b82f6")
              .build(),
          CalendarEvent.builder()
              .id("e2")
              .title("Review")
              .date(LocalDate.of(2026, 10, 12))
              .color("#c74634")
              .build(),
          CalendarEvent.builder()
              .id("e3")
              .title("Planning")
              .date(LocalDate.of(2026, 11, 3))
              .color("#3b82f6")
              .build());

  @UI("/team-calendar")
  @Title("Team calendar")
  public static class TeamCalendar extends CalendarPage {

    @Override
    protected LocalDate initialMonth() {
      return LocalDate.of(2026, 10, 1);
    }

    @Override
    protected List<CalendarEvent> events(LocalDate month, HttpRequest httpRequest) {
      return EVENTS.stream()
          .filter(
              event ->
                  event.date().getYear() == month.getYear()
                      && event.date().getMonth() == month.getMonth())
          .toList();
    }

    @Override
    protected Object actionOn(CalendarEvent event, HttpRequest httpRequest) {
      return URI.create("/events/" + event.id());
    }

    @Override
    protected boolean showCreate() {
      return true;
    }

    @Override
    protected Object createAction(HttpRequest httpRequest) {
      return URI.create("/events/new");
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(TeamCalendar.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private UIIncrementDto run(
      String actionId, Map<String, Object> state, Map<String, Object> parameters) {
    return mateu.run(
        RunActionRqDto.builder()
            .route("/team-calendar")
            .consumedRoute("/team-calendar")
            .serverSideType(TeamCalendar.class.getName())
            .actionId(actionId)
            .initiatorComponentId("cal_app")
            .componentState(state)
            .parameters(parameters)
            .build());
  }

  private static CalendarDto calendarOf(UIIncrementDto increment) {
    var calendars =
        FieldKindsSyncTest.collect(increment.fragments().get(0).component(), CalendarDto.class);
    assertThat(calendars).hasSize(1);
    return calendars.get(0);
  }

  private static List<String> eventTitles(UIIncrementDto increment) {
    return calendarOf(increment).events().stream().map(event -> event.title()).toList();
  }

  private static String navigationOf(UIIncrementDto increment) {
    var navigations =
        increment.commands().stream()
            .filter(command -> command.type() == UICommandTypeDto.NavigateTo)
            .toList();
    assertThat(navigations).hasSize(1);
    return String.valueOf(navigations.get(0).data());
  }

  @Test
  void initialRenderShowsTheInitialMonthWithItsEventsStampedForClicking() {
    var calendar = calendarOf(mateu.sync("/team-calendar"));
    assertThat(calendar.month()).isEqualTo("2026-10-01");
    assertThat(calendar.events()).hasSize(2);
    assertThat(calendar.events())
        .allSatisfy(event -> assertThat(event.actionId()).isEqualTo("openCalendarEvent"));
  }

  @Test
  void nextMonthRefetchesTheEventsOfTheNewMonth() {
    var increment = run("nextCalendarMonth", Map.of("_month", "2026-10-01"), Map.of());
    assertThat(eventTitles(increment)).containsExactly("Planning");
  }

  @Test
  void previousMonthMovesBackwards() {
    var increment = run("previousCalendarMonth", Map.of("_month", "2026-11-15"), Map.of());
    assertThat(eventTitles(increment)).containsExactly("Kickoff", "Review");
  }

  @Test
  void clickingAnEventRunsItsActionWithTheClickedEvent() {
    var increment =
        run(
            "openCalendarEvent",
            Map.of("_month", "2026-10-01"),
            Map.of("_clickedEvent", Map.of("id", "e2", "title", "Review", "date", "2026-10-12")));
    assertThat(navigationOf(increment)).isEqualTo("/events/e2");
  }

  @Test
  void theCreateButtonRunsTheCreateAction() {
    var increment = run("createCalendarEvent", Map.of("_month", "2026-10-01"), Map.of());
    assertThat(navigationOf(increment)).isEqualTo("/events/new");
  }
}
