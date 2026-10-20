package io.mateu.core.application;

import static io.mateu.core.application.FieldKindsSyncTest.collect;
import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.DashboardPanelDto;
import io.mateu.dtos.FoldoutLayoutDto;
import io.mateu.dtos.TabDto;
import io.mateu.uidl.annotations.Panel;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Markdown;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * The field-driven archetypes read the fields (and the Foldout its {@code @Title}) of the whole
 * class hierarchy: a subclass of an existing page — to mount it on another route, or to add one
 * panel — keeps everything its parent declares. They used to read only the concrete class, so the
 * subclass came out empty.
 */
class ArchetypeSubclassSyncTest {

  @UI("/sub-booking-foldout")
  public static class SubFoldout extends ArchetypesSyncTest.BookingFoldoutPage {
    @Panel(title = "Audit")
    Markdown audit = new Markdown("who changed what", null, null);
  }

  @UI("/sub-chair-overview")
  public static class SubOverview extends ArchetypesSyncTest.ChairOverview {}

  @UI("/sub-ops-dashboard")
  public static class SubDashboard extends ArchetypesSyncTest.OpsDashboard {}

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(SubFoldout.class, SubOverview.class, SubDashboard.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static Object root(String route) {
    return mateu.sync(route).fragments().get(0).component();
  }

  @Test
  void aFoldoutSubclassKeepsItsParentsPanelsAndTitle() {
    var foldouts = collect(root("/sub-booking-foldout"), FoldoutLayoutDto.class);
    assertThat(foldouts).hasSize(1);
    assertThat(foldouts.get(0).panels())
        .extracting(panel -> panel.title())
        .containsExactly("Payments", "Notes", "Audit");
    assertThat(foldouts.get(0).headerTitle()).isEqualTo("Booking 2026-0001");
  }

  @Test
  void anItemOverviewSubclassKeepsItsParentsTabs() {
    assertThat(collect(root("/sub-chair-overview"), TabDto.class))
        .extracting(tab -> tab.label())
        .containsExactly("Sales", "Specifications");
  }

  @Test
  void aDashboardSubclassKeepsItsParentsPanels() {
    assertThat(collect(root("/sub-ops-dashboard"), DashboardPanelDto.class))
        .extracting(panel -> panel.title())
        .contains("Monthly sales");
  }
}
