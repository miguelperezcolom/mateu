package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.orchestrators.calendar.CalendarPage;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.ButtonDto;
import io.mateu.dtos.CalendarDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UICommandTypeDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.CalendarDay;
import io.mateu.uidl.data.CalendarEvent;
import io.mateu.uidl.data.CalendarView;
import io.mateu.uidl.interfaces.HttpRequest;
import java.net.URI;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Calendar views (day, week, month, list), per-date cells and clickable dates — the shape of a
 * hotel's Property Calendar: the view switcher re-renders the period, the chevrons step by the
 * view, a week across two months asks both, and a date's cell runs its action with the date.
 */
class CalendarViewsSyncTest {

  @UI("/property-calendar")
  @Title("Property calendar")
  public static class PropertyCalendar extends CalendarPage {

    @Override
    protected LocalDate initialMonth() {
      return LocalDate.of(2026, 10, 28);
    }

    @Override
    protected List<CalendarView> views() {
      return List.of(CalendarView.month, CalendarView.week, CalendarView.day, CalendarView.list);
    }

    @Override
    protected List<CalendarEvent> events(LocalDate month, HttpRequest httpRequest) {
      return month.getMonthValue() == 10
          ? List.of(
              CalendarEvent.builder()
                  .id("conv")
                  .title("Convention")
                  .date(LocalDate.of(2026, 10, 29))
                  .endDate(LocalDate.of(2026, 10, 31))
                  .startTime("09:00")
                  .endTime("18:00")
                  .build())
          : List.of(
              CalendarEvent.builder()
                  .id("gala")
                  .title("Gala")
                  .date(LocalDate.of(2026, 11, 1))
                  .build());
    }

    @Override
    protected Object actionOn(CalendarEvent event, HttpRequest httpRequest) {
      return URI.create("/events/" + event.id());
    }

    @Override
    protected List<CalendarDay> days(LocalDate from, LocalDate to, HttpRequest httpRequest) {
      return from.datesUntil(to.plusDays(1))
          .map(
              d ->
                  new CalendarDay(
                      d, "Avail " + d.getDayOfMonth(), d.getDayOfMonth() == 30 ? "danger" : null))
          .toList();
    }

    @Override
    protected boolean daysClickable() {
      return true;
    }

    @Override
    protected Object actionOnDay(LocalDate date, HttpRequest httpRequest) {
      return URI.create("/availability?date=" + date);
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(PropertyCalendar.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private UIIncrementDto run(
      String actionId, Map<String, Object> state, Map<String, Object> parameters) {
    return mateu.run(
        RunActionRqDto.builder()
            .route("/property-calendar")
            .consumedRoute("/property-calendar")
            .serverSideType(PropertyCalendar.class.getName())
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

  @Test
  void monthViewCarriesItsDaysTheClickableDatesAndTheViewSwitcher() {
    var increment = mateu.sync("/property-calendar");
    var calendar = calendarOf(increment);
    assertThat(calendar.view()).isEqualTo("month");
    assertThat(calendar.dayActionId()).isEqualTo("openCalendarDay");
    assertThat(calendar.days()).hasSize(31);
    assertThat(calendar.days().get(29).tone()).isEqualTo("danger");
    var event = calendar.events().get(0);
    assertThat(event.endDate()).isEqualTo("2026-10-31");
    assertThat(event.startTime()).isEqualTo("09:00");
    var buttons =
        FieldKindsSyncTest.collect(increment.fragments().get(0).component(), ButtonDto.class);
    assertThat(buttons).extracting(ButtonDto::label).contains("Month", "Week", "Day", "List");
  }

  @Test
  void theWeekViewSpansTwoMonthsAndAsksBoth() {
    var calendar =
        calendarOf(
            run("switchCalendarView", Map.of("_month", "2026-10-28"), Map.of("_view", "week")));
    assertThat(calendar.view()).isEqualTo("week");
    // Mon 26 Oct → Sun 1 Nov: the October convention and the November gala
    assertThat(calendar.events()).extracting(e -> e.id()).containsExactly("conv", "gala");
    assertThat(calendar.days()).extracting(d -> d.date()).first().isEqualTo("2026-10-26");
    assertThat(calendar.days()).hasSize(7);
  }

  @Test
  void theChevronsStepByTheView() {
    var calendar =
        calendarOf(
            run("nextCalendarMonth", Map.of("_month", "2026-10-28", "_view", "day"), Map.of()));
    assertThat(calendar.view()).isEqualTo("day");
    assertThat(calendar.month()).isEqualTo("2026-10-29");
    assertThat(calendar.days()).hasSize(1);
  }

  @Test
  void clickingADateRunsTheDayAction() {
    var increment =
        run("openCalendarDay", Map.of("_month", "2026-10-28"), Map.of("_date", "2026-10-30"));
    var navigations =
        increment.commands().stream().filter(c -> c.type() == UICommandTypeDto.NavigateTo).toList();
    assertThat(navigations).hasSize(1);
    assertThat(String.valueOf(navigations.get(0).data()))
        .isEqualTo("/availability?date=2026-10-30");
  }
}
