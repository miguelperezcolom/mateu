package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.orchestrators.foldout.Foldout;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.uidl.annotations.Panel;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Badge;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Component;
import java.util.List;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * A list of components ({@code List<Badge>} — a Foldout's header badges) is display, not an
 * editable grid field: it must not register the twelve row-editing actions ({@code estado_add},
 * {@code estado_create}, …) a list of records gets.
 */
class ComponentListFieldSyncTest {

  @UI("/probe-badges-foldout")
  @Title("Student")
  public static class BadgesFoldout extends Foldout {
    List<Badge> estado =
        List.of(Badge.builder().text("Active").color("success").build(), new Badge("Grant"));

    Component summary = Text.builder().text("Ana").build();

    @Panel(title = "Personal data")
    Component personal = Text.builder().text("Born 2008").build();
  }

  public record Row(String name) {}

  @UI("/probe-record-list")
  @Title("Rows")
  public static class RecordList {
    List<Row> rows = List.of(new Row("a"));
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(BadgesFoldout.class, RecordList.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static List<String> actionIds(String route) {
    var component = (ServerSideComponentDto) mateu.sync(route).fragments().get(0).component();
    return component.actions().stream().map(action -> action.id()).toList();
  }

  @Test
  void aListOfBadgesRegistersNoRowEditingActions() {
    assertThat(actionIds("/probe-badges-foldout")).noneMatch(id -> id.startsWith("estado_"));
  }

  @Test
  void aListOfRecordsStillDoes() {
    assertThat(actionIds("/probe-record-list")).contains("rows_add", "rows_create", "rows_remove");
  }
}
