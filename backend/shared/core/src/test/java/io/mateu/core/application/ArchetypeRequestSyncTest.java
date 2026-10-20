package io.mateu.core.application;

import static io.mateu.core.application.FieldKindsSyncTest.collect;
import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.application.CalendarPageSyncTest.TeamCalendar;
import io.mateu.core.application.CollectionDetailSyncTest.HotelDirectory;
import io.mateu.core.application.GeneralOverviewSyncTest.RequisitionOverview;
import io.mateu.core.application.TodoListSyncTest.NoTasks;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.ButtonDto;
import io.mateu.dtos.EmptyStateDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.CalendarEvent;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Translator;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * The archetypes build their tree in a {@code Callable<Component>} field, which Mateu invokes while
 * it maps the page — and, for an action, while it checks the action is on the page. They used to
 * learn the request only later (from {@code triggers}), so on a first render their hooks ({@code
 * events}, {@code rows}…) got a null request and their built-in texts were translated with no
 * request, i.e. ignoring the browser's language.
 */
class ArchetypeRequestSyncTest {

  /** What each hook was handed, in order. */
  static final List<Object> SEEN = Collections.synchronizedList(new ArrayList<>());

  /** Spanish only for a request that asks for it: what a messages_es bundle does. */
  static class AcceptLanguageTranslator implements Translator {
    static final Map<String, String> ES =
        Map.of("Today", "Hoy", "All caught up!", "¡Todo al día!", "Select an item", "Selecciona");

    @Override
    public String translate(String text, HttpRequest httpRequest) {
      var language = httpRequest == null ? null : httpRequest.getHeaderValue("Accept-Language");
      return language != null && language.startsWith("es") ? ES.getOrDefault(text, text) : text;
    }
  }

  @UI("/rq-calendar")
  public static class RqCalendar extends TeamCalendar {
    @Override
    protected List<CalendarEvent> events(LocalDate month, HttpRequest httpRequest) {
      SEEN.add(httpRequest == null ? "null" : httpRequest);
      return super.events(month, httpRequest);
    }
  }

  @UI("/rq-tasks")
  public static class RqTasks extends NoTasks {
    @Override
    protected List<TodoListSyncTest.Task> rows(HttpRequest httpRequest) {
      SEEN.add(httpRequest == null ? "null" : httpRequest);
      return super.rows(httpRequest);
    }
  }

  @UI("/rq-hotels")
  public static class RqHotels extends HotelDirectory {
    @Override
    protected List<CollectionDetailSyncTest.Hotel> rows(
        String searchText, HttpRequest httpRequest) {
      SEEN.add(httpRequest == null ? "null" : httpRequest);
      return super.rows(searchText, httpRequest);
    }
  }

  @UI("/rq-overview")
  public static class RqOverview extends RequisitionOverview {
    @Override
    protected List<Option> switcherOptions(HttpRequest httpRequest) {
      SEEN.add(httpRequest == null ? "null" : httpRequest);
      return super.switcherOptions(httpRequest);
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu =
        TestMateu.withUisAndBeans(
            List.of(new AcceptLanguageTranslator()),
            RqCalendar.class,
            RqTasks.class,
            RqHotels.class,
            RqOverview.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @BeforeEach
  void clear() {
    SEEN.clear();
  }

  private static Object spanish(String route, Class<?> type, String actionId) {
    return mateu
        .run(
            RunActionRqDto.builder()
                .route(route)
                .consumedRoute(route)
                .serverSideType(type.getName())
                .actionId(actionId)
                .initiatorComponentId("c1")
                .componentState(Map.of())
                .parameters(Map.of())
                .build(),
            Map.of("Accept-Language", "es-ES"))
        .fragments()
        .get(0)
        .component();
  }

  @Test
  void theFirstRenderHandsEveryHookTheRequest() {
    spanish("/rq-calendar", RqCalendar.class, "");
    spanish("/rq-tasks", RqTasks.class, "");
    spanish("/rq-hotels", RqHotels.class, "");
    spanish("/rq-overview", RqOverview.class, "");
    assertThat(SEEN).isNotEmpty().doesNotContain("null");
  }

  @Test
  void anActionHandsTheHooksTheRequestToo() {
    spanish("/rq-calendar", RqCalendar.class, "nextCalendarMonth");
    assertThat(SEEN).isNotEmpty().doesNotContain("null");
  }

  @Test
  void theBuiltInTextsFollowTheBrowsersLanguageOnTheFirstRender() {
    assertThat(collect(spanish("/rq-calendar", RqCalendar.class, ""), ButtonDto.class))
        .extracting(ButtonDto::label)
        .contains("Hoy");
    assertThat(collect(spanish("/rq-tasks", RqTasks.class, ""), EmptyStateDto.class))
        .extracting(EmptyStateDto::title)
        .contains("¡Todo al día!");
    assertThat(collect(spanish("/rq-hotels", RqHotels.class, ""), EmptyStateDto.class))
        .extracting(EmptyStateDto::title)
        .contains("Selecciona");
  }
}
