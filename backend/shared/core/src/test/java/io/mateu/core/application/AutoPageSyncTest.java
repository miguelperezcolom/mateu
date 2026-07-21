package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.ComponentMetadataDto;
import io.mateu.dtos.DashboardLayoutDto;
import io.mateu.dtos.DashboardPanelDto;
import io.mateu.dtos.MetricCardDto;
import io.mateu.dtos.ScoreboardDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.AutoPage;
import io.mateu.uidl.annotations.Panel;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.MetricCard;
import io.mateu.uidl.data.Text;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Fase 1 of page-level inference: under {@code @AutoPage}, a plain class declaring MetricCard
 * fields renders as the Dashboard archetype composition (scoreboard band + panel tiles), advertises
 * the model as serverSideType so actions keep routing, and stamps pageType=dashboard — while the
 * same class without the annotation keeps the previous plain-form rendering. See
 * design/page-level-inference-plan.md.
 */
class AutoPageSyncTest {

  // ---------------------------------------------------------------- fixtures

  @SuppressWarnings("unused")
  @UI("/inferred-dashboard")
  @Title("Ops")
  @AutoPage
  public static class InferredOps {

    MetricCard revenue = MetricCard.builder().title("Revenue").value("1.2").unit("M€").build();

    MetricCard occupancy = MetricCard.builder().title("Occupancy").value("87%").build();

    @Panel(title = "Monthly sales")
    Text sales = new Text("sales-text", "sales chart placeholder");
  }

  @SuppressWarnings("unused")
  @UI("/plain-metrics")
  @Title("Ops, uninferred")
  public static class PlainOps {

    MetricCard revenue = MetricCard.builder().title("Revenue").value("1.2").build();

    String note = "still a plain form";
  }

  // ---------------------------------------------------------------- harness

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(InferredOps.class, PlainOps.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  // ---------------------------------------------------------------- tests

  @Test
  void autoPageClassWithMetricCardsComposesTheDashboardArchetype() {
    var increment = mateu.sync("/inferred-dashboard");

    var layout = findFirst(increment, DashboardLayoutDto.class);
    assertThat(layout).isNotNull();

    var scoreboard = findFirst(increment, ScoreboardDto.class);
    assertThat(scoreboard).isNotNull();
    var metrics =
        scoreboard.children().stream()
            .map(child -> ((ClientSideComponentDto) child).metadata())
            .toList();
    assertThat(metrics).hasSize(2).allMatch(MetricCardDto.class::isInstance);
    assertThat(metrics.stream().map(metric -> ((MetricCardDto) metric).title()))
        .containsExactly("Revenue", "Occupancy");

    var panel = findFirst(increment, DashboardPanelDto.class);
    assertThat(panel).isNotNull();
    assertThat(((DashboardPanelDto) panel.metadata()).title()).isEqualTo("Monthly sales");
  }

  @Test
  void theWireAdvertisesTheModelAsServerSideTypeAndDashboardPageType() {
    var increment = mateu.sync("/inferred-dashboard");

    var server = firstServerSide(increment);
    assertThat(server).isNotNull();
    assertThat(server.serverSideType()).isEqualTo(InferredOps.class.getName());
    assertThat(server.pageType()).isEqualTo("dashboard");
  }

  @Test
  void withoutAutoPageTheSameShapeKeepsRenderingAsAPlainForm() {
    var increment = mateu.sync("/plain-metrics");

    assertThat(findFirst(increment, DashboardLayoutDto.class)).isNull();
    assertThat(findFirst(increment, ScoreboardDto.class)).isNull();
  }

  // ---------------------------------------------------------------- helpers

  private static ServerSideComponentDto firstServerSide(UIIncrementDto increment) {
    for (var fragment : increment.fragments()) {
      if (fragment.component() instanceof ServerSideComponentDto server) {
        return server;
      }
    }
    return null;
  }

  private static ClientSideComponentDto findFirst(
      UIIncrementDto increment, Class<? extends ComponentMetadataDto> type) {
    var all = new ArrayList<ClientSideComponentDto>();
    increment.fragments().forEach(fragment -> collect(fragment.component(), type, all));
    return all.isEmpty() ? null : all.get(0);
  }

  private static void collect(
      Object component,
      Class<? extends ComponentMetadataDto> type,
      List<ClientSideComponentDto> found) {
    if (component instanceof ServerSideComponentDto server) {
      server.children().forEach(child -> collect(child, type, found));
      return;
    }
    if (!(component instanceof ClientSideComponentDto client)) {
      return;
    }
    if (type.isInstance(client.metadata())) {
      found.add(client);
    }
    client.children().forEach(child -> collect(child, type, found));
  }
}
