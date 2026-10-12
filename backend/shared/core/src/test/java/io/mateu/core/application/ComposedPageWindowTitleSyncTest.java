package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.orchestrators.dashboard.Dashboard;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.UICommandDto;
import io.mateu.dtos.UICommandTypeDto;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.MetricCard;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * A composed page — a {@link ComponentTreeSupplier}, which every tree-building archetype is
 * (Dashboard, Welcome, HeroSearch, SmartSearchPage, Foldout, ItemOverview, GanttPage,
 * DataManagement) — is not reflected as a page, and its {@code @Title} never reached the window:
 * the browser tab kept the PREVIOUS page's title and the route-change announcement screen readers
 * rely on (SetWindowTitle) never came. A declared title now travels; an undeclared one does not (a
 * component tree's class name is no title).
 */
class ComposedPageWindowTitleSyncTest {

  @UI("/composed-titled")
  @Title("Sales overview")
  public static class Titled implements ComponentTreeSupplier {
    @Override
    public Component component(HttpRequest httpRequest) {
      return new Text("hello");
    }
  }

  @UI("/composed-untitled")
  public static class Untitled implements ComponentTreeSupplier {
    @Override
    public Component component(HttpRequest httpRequest) {
      return new Text("hello");
    }
  }

  @UI("/composed-dashboard")
  @Title("Sales dashboard")
  public static class SalesDashboard extends Dashboard {
    public MetricCard revenue = MetricCard.builder().title("Revenue").value("1.2M").build();
  }

  /** A plain class composed into a dashboard by @AutoPage: the title is the MODEL's. */
  @UI("/composed-inferred")
  @Title("Ops board")
  @io.mateu.uidl.annotations.AutoPage
  public static class Inferred {
    public MetricCard revenue =
        MetricCard.builder().title("Revenue").value("1.2M").actionId("drillRevenue").build();

    public void drillRevenue() {}
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(Titled.class, Untitled.class, SalesDashboard.class, Inferred.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static List<Object> windowTitles(String route) {
    return mateu.sync(route).commands().stream()
        .filter(command -> command.type() == UICommandTypeDto.SetWindowTitle)
        .map(UICommandDto::data)
        .toList();
  }

  @Test
  void aComposedPageWithATitleNamesTheWindow() {
    assertThat(windowTitles("/composed-titled")).containsExactly("Sales overview");
  }

  @Test
  void anArchetypePageNamesTheWindowToo() {
    assertThat(windowTitles("/composed-dashboard")).containsExactly("Sales dashboard");
  }

  @Test
  void anInferredDashboardNamesTheWindowFromItsModel() {
    assertThat(windowTitles("/composed-inferred")).containsExactly("Ops board");
  }

  @Test
  void anInferredDashboardAdvertisesItsModelsDrillIns() {
    // the harvester read the BRIDGE's methods: a composed dashboard advertised none of its
    // metric actions and the browser dropped every drill-in click
    var page =
        (io.mateu.dtos.ServerSideComponentDto)
            mateu.sync("/composed-inferred").fragments().get(0).component();
    assertThat(page.actions()).extracting(io.mateu.dtos.ActionDto::id).contains("drillRevenue");
  }

  @Test
  void aComposedPageWithoutATitleSendsNone() {
    assertThat(windowTitles("/composed-untitled")).isEmpty();
  }
}
