package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.orchestrators.datamanagement.DataManagement;
import io.mateu.core.infra.declarative.orchestrators.foldout.Foldout;
import io.mateu.core.infra.declarative.orchestrators.generaloverview.GeneralOverview;
import io.mateu.core.infra.declarative.orchestrators.smartsearch.SmartSearchPage;
import io.mateu.core.infra.declarative.orchestrators.welcome.Welcome;
import io.mateu.core.testutil.TestMateu;
import io.mateu.core.testutil.WireWalk;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.CrudlDto;
import io.mateu.dtos.FoldoutLayoutDto;
import io.mateu.dtos.HeroSectionDto;
import io.mateu.dtos.ResponsiveGridDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.TextDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Panel;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.annotations.WelcomeBanner;
import io.mateu.uidl.data.DockedPanel;
import io.mateu.uidl.data.GeneralOverviewDisplay;
import io.mateu.uidl.data.HeroTone;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.NoFilters;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.Toggle;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * The Redwood slots that were missing on the archetypes: GeneralOverview's {@code info} (+ {@code
 * promoteInfoSlot}), the foldout panel's folded {@code summary}, DataManagement's docked panels
 * ({@code innerEnd}/{@code innerBottom}), SmartSearchPage's pre-search content (the smart filter
 * search {@code dashboard} slot) and the hero tone of Welcome / {@code @WelcomeBanner}.
 */
class PageSlotsSyncTest {

  // --- GeneralOverview info --------------------------------------------------------------------

  @UI("/overview-with-info")
  @Title("Customers")
  public static class CustomerOverview extends GeneralOverview<String> {
    @Override
    protected List<Option> switcherOptions(HttpRequest httpRequest) {
      return List.of(new Option("c1", "Ada"), new Option("c2", "Grace"));
    }

    @Override
    protected String load(String id, HttpRequest httpRequest) {
      return id;
    }

    @Override
    protected Component overview(String row, HttpRequest httpRequest) {
      return new Text("main-" + row);
    }

    @Override
    protected Component info(String row, HttpRequest httpRequest) {
      return new Text("info-" + row);
    }
  }

  @UI("/overview-info-promoted")
  @Title("Customers")
  public static class PromotedOverview extends CustomerOverview {
    @Override
    protected GeneralOverviewDisplay display() {
      return GeneralOverviewDisplay.defaults().toBuilder().promoteInfoSlot(Toggle.on).build();
    }
  }

  @Test
  void theInfoSlotSitsBesideTheOverviewOnTheOneResponsiveGrid() {
    var increment = mateu.sync("/overview-with-info");
    var grid = gridWithId(increment, "general-overview");
    assertThat(grid.gridTemplateAreas()).isEqualTo("\"main info\"");
    assertThat(slotsOf(increment, "general-overview")).containsExactly("main", "info");
  }

  @Test
  void promoteInfoSlotPutsTheInfoFirstSoItStacksOnTop() {
    var increment = mateu.sync("/overview-info-promoted");
    assertThat(slotsOf(increment, "general-overview")).containsExactly("info", "main");
  }

  // --- Foldout summary -------------------------------------------------------------------------

  @UI("/foldout-with-summary")
  @Title("Booking")
  public static class BookingFoldout extends Foldout {
    Component overview = new Text("overview");

    @Panel(title = "Payments", open = false)
    Component payments = new Text("payments");

    @Override
    protected Component panelSummary(String panelFieldName) {
      return "payments".equals(panelFieldName) ? new Text("payments-summary", "€120 due") : null;
    }
  }

  @Test
  void aFoldedPanelCarriesItsSummaryAsASlottedChild() {
    var increment = mateu.sync("/foldout-with-summary");
    var foldout =
        WireWalk.all(increment, ClientSideComponentDto.class).stream()
            .filter(c -> c.metadata() instanceof FoldoutLayoutDto)
            .findFirst()
            .orElseThrow();
    assertThat(foldout.children())
        .extracting(c -> ((ClientSideComponentDto) c).slot())
        .contains("summary-0", "panel-0");
    var summary =
        foldout.children().stream()
            .filter(c -> "summary-0".equals(((ClientSideComponentDto) c).slot()))
            .findFirst()
            .get();
    assertThat(WireWalk.first(summary, TextDto.class).text()).isEqualTo("€120 due");
  }

  // --- DataManagement docked panels ------------------------------------------------------------

  @UI("/data-management-docked")
  @Title("Shipments")
  public static class Shipments extends DataManagement {
    @Override
    protected Component gridView(HttpRequest httpRequest) {
      return new Text("grid");
    }

    @Override
    protected Component ganttView(HttpRequest httpRequest) {
      return new Text("gantt");
    }

    @Override
    protected DockedPanel endPanel(HttpRequest httpRequest) {
      return DockedPanel.builder()
          .id("details")
          .title("Details")
          .content(new Text("details-body"))
          .open(true)
          .build();
    }

    @Override
    protected DockedPanel bottomPanel(HttpRequest httpRequest) {
      return DockedPanel.builder().id("log").title("Log").content(new Text("log-body")).build();
    }
  }

  @Test
  void anOpenEndPanelReflowsTheContentAndEachPanelGetsAToggle() {
    var increment = mateu.sync("/data-management-docked");
    var grid = gridWithId(increment, "data-management-body");
    assertThat(grid.gridTemplateColumns()).isEqualTo("1fr 22rem");
    assertThat(texts(increment)).contains("details-body").doesNotContain("log-body");
    assertThat(WireWalk.all(increment, io.mateu.dtos.ButtonDto.class))
        .extracting(b -> b.actionId())
        .contains("toggleEndPanel", "toggleBottomPanel");
  }

  @Test
  void togglingAPanelFlipsItInPlace() {
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/data-management-docked")
                .consumedRoute("/data-management-docked")
                .serverSideType(Shipments.class.getName())
                .actionId("toggleBottomPanel")
                .initiatorComponentId("c1_app")
                .componentState(Map.of())
                .build());
    assertThat(texts(increment)).contains("log-body", "details-body");
  }

  // --- SmartSearchPage pre-search content ------------------------------------------------------

  public record Hit(String id, String name) {}

  @UI("/smart-search-presearch")
  @Title("Find a guest")
  public static class GuestSearch extends SmartSearchPage<NoFilters, Hit> {
    @Override
    public ListingData<Hit> search(SearchRequest request, HttpRequest httpRequest) {
      return ListingData.of(new Hit("1", "Ada"));
    }

    @Override
    protected Component preSearchContent(HttpRequest httpRequest) {
      return new Text("recent", "Recently viewed: Ada, Grace");
    }
  }

  @Test
  void preSearchContentTravelsOnTheListingUntilTheFirstSearch() {
    var increment = mateu.sync("/smart-search-presearch");
    var crud = WireWalk.first(increment, CrudlDto.class);
    assertThat(crud.preSearch()).hasSize(1);
    assertThat(WireWalk.first(crud.preSearch(), TextDto.class).text())
        .isEqualTo("Recently viewed: Ada, Grace");
  }

  // --- hero tone -------------------------------------------------------------------------------

  @UI("/welcome-toned")
  public static class TonedWelcome extends Welcome {
    @Override
    protected String heroTitle() {
      return "Hello";
    }

    @Override
    protected HeroTone heroTone() {
      return HeroTone.pine;
    }
  }

  @UI("/welcome-banner-toned")
  @Title("Inbox")
  @WelcomeBanner(subtitle = "3 new", tone = HeroTone.plum)
  public static class TonedBannerPage {
    public String note = "";
  }

  @UI("/welcome-untoned")
  public static class PlainWelcome extends Welcome {
    @Override
    protected String heroTitle() {
      return "Hello";
    }
  }

  @Test
  void theHeroToneTravelsAsItsHueName() {
    assertThat(WireWalk.first(mateu.sync("/welcome-toned"), HeroSectionDto.class).tone())
        .isEqualTo("pine");
    assertThat(WireWalk.first(mateu.sync("/welcome-banner-toned"), HeroSectionDto.class).tone())
        .isEqualTo("plum");
    // auto = the default look: nothing on the wire
    assertThat(WireWalk.first(mateu.sync("/welcome-untoned"), HeroSectionDto.class).tone())
        .isNull();
  }

  // --- harness ---------------------------------------------------------------------------------

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu =
        TestMateu.withUis(
            CustomerOverview.class,
            PromotedOverview.class,
            BookingFoldout.class,
            Shipments.class,
            GuestSearch.class,
            TonedWelcome.class,
            TonedBannerPage.class,
            PlainWelcome.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static ResponsiveGridDto gridWithId(UIIncrementDto increment, String id) {
    return WireWalk.all(increment, ClientSideComponentDto.class).stream()
        .filter(c -> id.equals(c.id()) && c.metadata() instanceof ResponsiveGridDto)
        .map(c -> (ResponsiveGridDto) c.metadata())
        .findFirst()
        .orElseThrow(() -> new AssertionError("no grid " + id));
  }

  private static List<String> slotsOf(UIIncrementDto increment, String id) {
    return WireWalk.all(increment, ClientSideComponentDto.class).stream()
        .filter(c -> id.equals(c.id()))
        .findFirst()
        .orElseThrow()
        .children()
        .stream()
        .map(c -> ((ClientSideComponentDto) c).slot())
        .toList();
  }

  private static List<String> texts(UIIncrementDto increment) {
    return WireWalk.all(increment, TextDto.class).stream().map(TextDto::text).toList();
  }
}
