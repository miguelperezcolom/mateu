package io.mateu.core.application;

import static io.mateu.core.application.FieldKindsSyncTest.collect;
import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.ButtonDto;
import io.mateu.dtos.EmptyStateDto;
import io.mateu.dtos.TaskQueueDto;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Translator;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * The texts the archetypes write themselves — the calendar's Today / + Create / view switcher, the
 * to-do list's and the collection detail's empty states and item counter — go through the app's
 * {@link Translator}, like every other built-in text. They were fixed English, mixed with the app's
 * own language on screen.
 */
class ArchetypeBuiltInTextsSyncTest {

  static final Map<String, String> SPANISH =
      Map.of(
          "Today", "Hoy",
          "+ Create", "+ Crear",
          "Month", "Mes",
          "Week", "Semana",
          "All caught up!", "¡Todo al día!",
          "Select an item", "Selecciona un elemento",
          "items", "elementos");

  static class SpanishTranslator implements Translator {
    @Override
    public String translate(String text, HttpRequest httpRequest) {
      return SPANISH.getOrDefault(text, text);
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu =
        TestMateu.withUisAndBeans(
            List.of(new SpanishTranslator()),
            CalendarPageSyncTest.TeamCalendar.class,
            CalendarViewsSyncTest.PropertyCalendar.class,
            TodoListSyncTest.NoTasks.class,
            CollectionDetailSyncTest.HotelDirectory.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static Object root(String route) {
    return mateu.sync(route).fragments().get(0).component();
  }

  @Test
  void theCalendarToolbarSpeaksTheAppsLanguage() {
    assertThat(collect(root("/team-calendar"), ButtonDto.class))
        .extracting(ButtonDto::label)
        .contains("Hoy", "+ Crear")
        .doesNotContain("Today", "+ Create");
    assertThat(collect(root("/property-calendar"), ButtonDto.class))
        .extracting(ButtonDto::label)
        .contains("Mes", "Semana")
        .doesNotContain("Month", "Week");
  }

  @Test
  void theEmptyStatesAndTheCounterSpeakTheAppsLanguage() {
    assertThat(collect(root("/no-tasks"), EmptyStateDto.class))
        .extracting(EmptyStateDto::title)
        .contains("¡Todo al día!");
    var directory = root("/hotel-directory");
    assertThat(collect(directory, EmptyStateDto.class))
        .extracting(EmptyStateDto::title)
        .contains("Selecciona un elemento");
    assertThat(collect(directory, TaskQueueDto.class).get(0).groups().get(0).label())
        .endsWith(" elementos");
  }
}
