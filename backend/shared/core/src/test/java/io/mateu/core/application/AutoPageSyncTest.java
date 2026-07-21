package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.ButtonDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.ComponentMetadataDto;
import io.mateu.dtos.DashboardLayoutDto;
import io.mateu.dtos.DashboardPanelDto;
import io.mateu.dtos.HeroSectionDto;
import io.mateu.dtos.MetricCardDto;
import io.mateu.dtos.ScoreboardDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.AutoPage;
import io.mateu.uidl.annotations.Panel;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Button;
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

  @SuppressWarnings("unused")
  @UI("/inferred-welcome")
  @Title("Front desk")
  @AutoPage
  public static class InferredHome {

    Button start = Button.builder().label("Start check-in").actionId("startCheckin").build();

    Button explore = Button.builder().label("Explore rooms").actionId("exploreRooms").build();

    @Panel(title = "Today")
    Text today = new Text("today-text", "42 arrivals expected");
  }

  @SuppressWarnings("unused")
  @UI("/form-with-button")
  @Title("Not a landing")
  @AutoPage
  public static class FormWithButton {

    Button submit = Button.builder().label("Submit").actionId("submit").build();

    String name; // a data field: this is a form that happens to have a button
  }

  // ---------------------------------------------------------------- harness

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu =
        TestMateu.withUis(
            InferredOps.class, PlainOps.class, InferredHome.class, FormWithButton.class);
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
  void autoPageClassWithOnlyButtonsAndPanelsComposesTheWelcomeLanding() {
    var increment = mateu.sync("/inferred-welcome");

    var hero = findFirst(increment, HeroSectionDto.class);
    assertThat(hero).isNotNull();
    assertThat(((HeroSectionDto) hero.metadata()).title()).isEqualTo("Front desk");
    assertThat(((HeroSectionDto) hero.metadata()).centered()).isTrue();

    var ctas =
        hero.children().stream()
            .map(child -> ((ClientSideComponentDto) child).metadata())
            .filter(ButtonDto.class::isInstance)
            .map(ButtonDto.class::cast)
            .toList();
    assertThat(ctas).hasSize(2);
    assertThat(ctas.get(0).label()).isEqualTo("Start check-in");
    assertThat(ctas.get(0).actionId()).isEqualTo("startCheckin");

    var tile = findFirst(increment, DashboardPanelDto.class);
    assertThat(tile).isNotNull();
    assertThat(((DashboardPanelDto) tile.metadata()).title()).isEqualTo("Today");

    var server = firstServerSide(increment);
    assertThat(server.serverSideType()).isEqualTo(InferredHome.class.getName());
    assertThat(server.pageType()).isEqualTo("landing");
  }

  @Test
  void aDataFieldKeepsAnAutoPageClassWithButtonsAsAPlainForm() {
    var increment = mateu.sync("/form-with-button");

    assertThat(findFirst(increment, HeroSectionDto.class)).isNull();
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
