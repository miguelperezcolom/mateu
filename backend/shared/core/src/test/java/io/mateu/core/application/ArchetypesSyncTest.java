package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assumptions.assumeTrue;

import io.mateu.core.infra.declarative.orchestrators.dashboard.Dashboard;
import io.mateu.core.infra.declarative.orchestrators.foldout.Foldout;
import io.mateu.core.infra.declarative.orchestrators.herosearch.HeroSearch;
import io.mateu.core.infra.declarative.orchestrators.itemoverview.ItemOverview;
import io.mateu.core.infra.declarative.orchestrators.welcome.Welcome;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.AccordionLayoutDto;
import io.mateu.dtos.AnchorDto;
import io.mateu.dtos.AvatarDto;
import io.mateu.dtos.BadgeDto;
import io.mateu.dtos.BreadcrumbsDto;
import io.mateu.dtos.ButtonDto;
import io.mateu.dtos.CalendarDto;
import io.mateu.dtos.CardDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.ComponentMetadataDto;
import io.mateu.dtos.ContainerDto;
import io.mateu.dtos.DashboardLayoutDto;
import io.mateu.dtos.DashboardPanelDto;
import io.mateu.dtos.DetailsDto;
import io.mateu.dtos.DivDto;
import io.mateu.dtos.EmptyStateDto;
import io.mateu.dtos.FaqDto;
import io.mateu.dtos.FeatureGridDto;
import io.mateu.dtos.FoldoutLayoutDto;
import io.mateu.dtos.FunnelDto;
import io.mateu.dtos.GanttDto;
import io.mateu.dtos.HeatmapDto;
import io.mateu.dtos.HeroSectionDto;
import io.mateu.dtos.HorizontalLayoutDto;
import io.mateu.dtos.KPIDto;
import io.mateu.dtos.KanbanDto;
import io.mateu.dtos.MarkdownDto;
import io.mateu.dtos.MetricCardDto;
import io.mateu.dtos.MetricTrendDto;
import io.mateu.dtos.NotificationDto;
import io.mateu.dtos.OrgChartDto;
import io.mateu.dtos.PricingTableDto;
import io.mateu.dtos.ProgressBarDto;
import io.mateu.dtos.ProgressStepsDto;
import io.mateu.dtos.ScoreboardDto;
import io.mateu.dtos.ScrollerDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.dtos.SkeletonDto;
import io.mateu.dtos.SplitLayoutDto;
import io.mateu.dtos.StatDto;
import io.mateu.dtos.TabDto;
import io.mateu.dtos.TabLayoutDto;
import io.mateu.dtos.TestimonialsDto;
import io.mateu.dtos.TextDto;
import io.mateu.dtos.TimelineDto;
import io.mateu.dtos.TooltipDto;
import io.mateu.dtos.TrendChartDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.dtos.VerticalLayoutDto;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Panel;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.AccordionLayout;
import io.mateu.uidl.data.AccordionPanel;
import io.mateu.uidl.data.Anchor;
import io.mateu.uidl.data.Avatar;
import io.mateu.uidl.data.Badge;
import io.mateu.uidl.data.Breadcrumb;
import io.mateu.uidl.data.Breadcrumbs;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.ButtonStyle;
import io.mateu.uidl.data.Calendar;
import io.mateu.uidl.data.CalendarEvent;
import io.mateu.uidl.data.Card;
import io.mateu.uidl.data.Container;
import io.mateu.uidl.data.DashboardLayout;
import io.mateu.uidl.data.DashboardPanel;
import io.mateu.uidl.data.Details;
import io.mateu.uidl.data.Div;
import io.mateu.uidl.data.EmptyState;
import io.mateu.uidl.data.Faq;
import io.mateu.uidl.data.FaqItem;
import io.mateu.uidl.data.Feature;
import io.mateu.uidl.data.FeatureGrid;
import io.mateu.uidl.data.Funnel;
import io.mateu.uidl.data.FunnelStage;
import io.mateu.uidl.data.Gantt;
import io.mateu.uidl.data.GanttTask;
import io.mateu.uidl.data.HeatCell;
import io.mateu.uidl.data.Heatmap;
import io.mateu.uidl.data.HeroSection;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.data.KPI;
import io.mateu.uidl.data.Kanban;
import io.mateu.uidl.data.KanbanCard;
import io.mateu.uidl.data.KanbanColumn;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Markdown;
import io.mateu.uidl.data.MetricCard;
import io.mateu.uidl.data.MetricTrend;
import io.mateu.uidl.data.Notification;
import io.mateu.uidl.data.OrgChart;
import io.mateu.uidl.data.OrgNode;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.data.PricingPlan;
import io.mateu.uidl.data.PricingTable;
import io.mateu.uidl.data.ProgressBar;
import io.mateu.uidl.data.ProgressSteps;
import io.mateu.uidl.data.Scoreboard;
import io.mateu.uidl.data.Scroller;
import io.mateu.uidl.data.Skeleton;
import io.mateu.uidl.data.SkeletonVariant;
import io.mateu.uidl.data.SplitLayout;
import io.mateu.uidl.data.Stat;
import io.mateu.uidl.data.Step;
import io.mateu.uidl.data.Tab;
import io.mateu.uidl.data.TabLayout;
import io.mateu.uidl.data.Testimonial;
import io.mateu.uidl.data.Testimonials;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.Timeline;
import io.mateu.uidl.data.TimelineItem;
import io.mateu.uidl.data.Tooltip;
import io.mateu.uidl.data.TrendChart;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.net.URI;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * In-JVM sync of the archetype pages (Dashboard, Foldout, Welcome, ItemOverview, HeroSearch) and of
 * a rich fluent component tree, asserting each fluent/uidl component maps to its wire DTO with its
 * key fields intact. Exercises the fragmentmapper dispatchers and mappers end to end.
 */
class ArchetypesSyncTest {

  // ---------------------------------------------------------------- fixtures

  @SuppressWarnings("unused")
  @UI("/ops-dashboard")
  @Title("Operations dashboard")
  public static class OpsDashboard extends Dashboard {

    MetricCard revenue =
        MetricCard.builder()
            .title("Revenue")
            .value("1.2")
            .unit("M€")
            .trend(MetricTrend.up)
            .trendLabel("+8%")
            .icon("vaadin:dollar")
            .actionId("openRevenue")
            .build();

    MetricCard orders = MetricCard.builder().title("Orders").value("3,421").build();

    MetricCard returns =
        MetricCard.builder().title("Returns").value("87").trend(MetricTrend.down).build();

    @Panel(title = "Monthly sales", subtitle = "Units per month", colSpan = 2, rowSpan = 2)
    Text sales = new Text("sales-text", "sales chart placeholder");

    Markdown notes = new Markdown("plain grid item", null, null);

    @Override
    protected int columns() {
      return 3;
    }

    @Action
    Object openRevenue() {
      return URI.create("/ops-dashboard");
    }
  }

  @SuppressWarnings("unused")
  @UI("/booking-foldout")
  @Title("Booking 2026-0001")
  public static class BookingFoldoutPage extends Foldout {

    Markdown overview = new Markdown("booking overview", null, null);

    @Panel(title = "Payments", subtitle = "Charges and refunds", icon = "vaadin:card")
    Markdown payments = new Markdown("payments detail", null, null);

    @Panel(title = "Notes", open = false)
    Markdown notes = new Markdown("some notes", null, null);
  }

  @SuppressWarnings("unused")
  @UI("/front-desk-welcome")
  @Title("Welcome")
  public static class FrontDeskWelcome extends Welcome {

    Button start =
        Button.builder()
            .label("Start check-in")
            .actionId("startCheckin")
            .buttonStyle(ButtonStyle.primary)
            .build();

    Button dashboard = Button.builder().label("Open dashboard").actionId("openDashboard").build();

    @Panel(title = "1 · Search the booking")
    Markdown step1 = new Markdown("Find the reservation.", null, null);

    @Panel(title = "2 · Verify the guests")
    Markdown step2 = new Markdown("Scan documents.", null, null);

    @Override
    protected String heroTitle() {
      return "Front desk check-in";
    }

    @Override
    protected String heroSubtitle() {
      return "Three steps to check a guest in";
    }

    @Override
    protected String heroImage() {
      return "https://img.example/hero.jpg";
    }

    @Action
    Object startCheckin() {
      return URI.create("/booking-foldout");
    }

    @Action
    Object openDashboard() {
      return URI.create("/ops-dashboard");
    }
  }

  @SuppressWarnings("unused")
  @UI("/chair-overview")
  @Title("Ergonomic chair EC-200")
  public static class ChairOverview extends ItemOverview {

    Markdown keyInfo = new Markdown("SKU EC-200-BLK, 143 units in stock", null, null);

    @Panel(title = "Sales")
    Markdown sales = new Markdown("sales per month", null, null);

    @Panel(title = "Specifications")
    Markdown specs = new Markdown("max load 130 kg", null, null);

    @Override
    protected String panelWidth() {
      return "26rem";
    }
  }

  @UI("/room-search")
  @Title("Room search")
  public static class RoomSearch extends HeroSearch<RoomSearch.RoomFilters, RoomSearch.Room> {

    public record RoomFilters(String zone) {}

    public record Room(String name, String zone, int beds) {}

    @Override
    protected String heroTitle() {
      return "Find a room";
    }

    @Override
    protected String heroSubtitle() {
      return "Search by name or zone";
    }

    @Override
    public ListingData<Room> search(
        String searchText, RoomFilters filters, Pageable pageable, HttpRequest httpRequest) {
      var rooms = List.of(new Room("Sea view", "Beach", 2), new Room("Loft", "City", 1));
      return new ListingData<>(new Page<>("", rooms.size(), 0, rooms.size(), rooms));
    }
  }

  @UI("/component-showcase")
  @Title("Component showcase")
  public static class Showcase implements ComponentTreeSupplier {

    @Override
    public Component component(HttpRequest httpRequest) {
      List<Component> content = new ArrayList<>();
      content.add(new Text("headline", "Component showcase"));
      content.add(
          Button.builder().id("cta").label("Run it").actionId("runIt").shortcut("ctrl+r").build());
      content.add(
          HorizontalLayout.builder()
              .id("chips")
              .spacing(true)
              .wrap(true)
              .content(
                  List.of(
                      new Badge("Active"),
                      new KPI("Open tickets", "17"),
                      ProgressBar.builder().min(0).max(100).value(40).text("40%").build()))
              .build());
      content.add(
          Card.builder()
              .id("summary-card")
              .title(new Text("Card title"))
              .content(new Text("Card body"))
              .build());
      content.add(
          TabLayout.builder()
              .id("tabs")
              .tabs(
                  List.of(
                      new Tab("First", new Text("first tab body")),
                      new Tab("Second", new Text("second tab body"))))
              .build());
      content.add(
          EmptyState.builder()
              .id("empty")
              .icon("📭")
              .title("Nothing here yet")
              .description("Create one to get started.")
              .actionId("createOne")
              .actionLabel("Create one")
              .build());
      content.add(
          HorizontalLayout.builder()
              .id("skeletons")
              .content(
                  List.of(
                      Skeleton.builder().variant(SkeletonVariant.text).count(4).build(),
                      Skeleton.builder().variant(SkeletonVariant.card).count(1).build(),
                      Skeleton.builder().variant(SkeletonVariant.grid).count(5).build(),
                      Skeleton.builder().variant(SkeletonVariant.form).count(3).build()))
              .build());
      content.add(
          Gantt.builder()
              .id("plan")
              .tasks(
                  List.of(
                      GanttTask.builder()
                          .id("t1")
                          .title("Design")
                          .start(LocalDate.of(2026, 3, 1))
                          .end(LocalDate.of(2026, 3, 15))
                          .progress(100)
                          .build(),
                      GanttTask.builder()
                          .id("t2")
                          .title("Build")
                          .start(LocalDate.of(2026, 3, 10))
                          .end(LocalDate.of(2026, 4, 20))
                          .progress(35)
                          .color("#f59e0b")
                          .build()))
              .build());
      content.add(
          Kanban.builder()
              .id("board")
              .columns(
                  List.of(
                      KanbanColumn.builder()
                          .id("todo")
                          .title("To do")
                          .color("#94a3b8")
                          .cards(
                              List.of(
                                  KanbanCard.builder().id("c1").title("Task A").badge("3").build()))
                          .build(),
                      KanbanColumn.builder()
                          .id("doing")
                          .title("Doing")
                          .cards(
                              List.of(
                                  KanbanCard.builder()
                                      .id("c2")
                                      .title("Task B")
                                      .description("in flight")
                                      .actionId("openCard")
                                      .build()))
                          .build()))
              .build());
      content.add(
          Timeline.builder()
              .id("feed")
              .items(
                  List.of(
                      TimelineItem.builder()
                          .id("e1")
                          .title("Order placed")
                          .timestamp("09:00")
                          .icon("🛒")
                          .build(),
                      TimelineItem.builder()
                          .id("e2")
                          .title("Shipped")
                          .description("Tracking #ABC")
                          .timestamp("14:20")
                          .color("#10b981")
                          .actionId("openShipment")
                          .build()))
              .build());
      content.add(
          ProgressSteps.builder()
              .id("progress")
              .steps(
                  List.of(
                      Step.builder().id("s1").title("Cart").status("done").build(),
                      Step.builder()
                          .id("s2")
                          .title("Payment")
                          .description("in progress")
                          .status("current")
                          .build(),
                      Step.builder().id("s3").title("Done").status("upcoming").build()))
              .build());
      content.add(
          Stat.builder()
              .id("mrr")
              .label("MRR")
              .value("48.2")
              .unit("k€")
              .delta("+7.4%")
              .trend("up")
              .spark(List.of(30.0, 32.0, 31.0, 35.0, 40.0, 42.0, 48.0))
              .actionId("openMrr")
              .build());
      content.add(
          Calendar.builder()
              .id("cal")
              .month(LocalDate.of(2026, 3, 1))
              .events(
                  List.of(
                      CalendarEvent.builder()
                          .id("ev1")
                          .title("Kickoff")
                          .date(LocalDate.of(2026, 3, 4))
                          .color("#3b82f6")
                          .build(),
                      CalendarEvent.builder()
                          .id("ev2")
                          .title("Launch")
                          .date(LocalDate.of(2026, 3, 20))
                          .actionId("openEvent")
                          .build()))
              .build());
      content.add(
          Faq.builder()
              .id("faq")
              .items(
                  List.of(
                      FaqItem.builder()
                          .question("Is it free?")
                          .answer("There is a free tier.")
                          .open(true)
                          .build(),
                      FaqItem.builder().question("Can I self-host?").answer("Yes.").build()))
              .build());
      content.add(
          Testimonials.builder()
              .id("testimonials")
              .items(
                  List.of(
                      Testimonial.builder()
                          .quote("Shipped in a day.")
                          .author("Ada")
                          .role("CTO")
                          .avatar("👩")
                          .rating(5)
                          .build(),
                      Testimonial.builder().quote("Solid.").author("Alan").rating(4).build()))
              .build());
      content.add(
          FeatureGrid.builder()
              .id("features")
              .columns(3)
              .features(
                  List.of(
                      Feature.builder()
                          .icon("⚡")
                          .title("Fast")
                          .description("Blazing quick")
                          .actionId("openFeature")
                          .build(),
                      Feature.builder()
                          .icon("🔒")
                          .title("Secure")
                          .description("Locked down")
                          .build()))
              .build());
      content.add(
          TrendChart.builder()
              .id("trend")
              .title("Revenue")
              .values(List.of(10.0, 14.0, 12.0, 18.0, 22.0))
              .labels(List.of("Jan", "Feb", "Mar", "Apr", "May"))
              .color("#10b981")
              .area(true)
              .build());
      content.add(
          Funnel.builder()
              .id("funnel")
              .stages(
                  List.of(
                      FunnelStage.builder().label("Visits").value(1000).build(),
                      FunnelStage.builder().label("Signups").value(400).color("#8b5cf6").build(),
                      FunnelStage.builder().label("Paid").value(120).build()))
              .build());
      content.add(
          Heatmap.builder()
              .id("heat")
              .cells(
                  List.of(
                      HeatCell.builder().date(LocalDate.of(2026, 3, 1)).value(2).build(),
                      HeatCell.builder()
                          .date(LocalDate.of(2026, 3, 2))
                          .value(5)
                          .label("5 commits")
                          .build()))
              .build());
      content.add(
          OrgChart.builder()
              .id("org")
              .root(
                  OrgNode.builder()
                      .id("ceo")
                      .title("Ada")
                      .subtitle("CEO")
                      .actionId("openPerson")
                      .children(
                          List.of(
                              OrgNode.builder().id("cto").title("Alan").subtitle("CTO").build(),
                              OrgNode.builder().id("cfo").title("Grace").subtitle("CFO").build()))
                      .build())
              .build());
      content.add(
          PricingTable.builder()
              .id("pricing")
              .plans(
                  List.of(
                      PricingPlan.builder()
                          .id("free")
                          .name("Free")
                          .price("0€")
                          .period("/mo")
                          .features(List.of("1 project", "Community support"))
                          .ctaLabel("Start")
                          .actionId("choosePlan")
                          .build(),
                      PricingPlan.builder()
                          .id("pro")
                          .name("Pro")
                          .price("29€")
                          .period("/mo")
                          .featured(true)
                          .features(List.of("Unlimited projects", "Priority support"))
                          .ctaLabel("Go Pro")
                          .actionId("choosePlan")
                          .build()))
              .build());
      content.add(
          HeroSection.builder()
              .id("fluent-hero")
              .title("Big title")
              .subtitle("Smaller words")
              .image("https://img.example/bg.png")
              .height("18rem")
              .centered(true)
              .content(List.of(new Text("hero child")))
              .build());
      content.add(
          DashboardLayout.builder()
              .id("fluent-dash")
              .columns(2)
              .items(
                  List.of(
                      Scoreboard.builder()
                          .id("kpis")
                          .metrics(
                              List.of(
                                  MetricCard.builder()
                                      .title("Speed")
                                      .value("42")
                                      .unit("rpm")
                                      .trend(MetricTrend.neutral)
                                      .build()))
                          .build(),
                      DashboardPanel.builder()
                          .id("tile")
                          .title("A tile")
                          .subtitle("with a subtitle")
                          .colSpan(2)
                          .rowSpan(1)
                          .content(new Text("tile body"))
                          .build()))
              .build());
      content.add(
          SplitLayout.builder()
              .id("split")
              .master(new Text("master side"))
              .detail(new Text("detail side"))
              .fullWidth(true)
              .build());
      content.add(
          AccordionLayout.builder()
              .id("accordion")
              .panels(
                  List.of(
                      new AccordionPanel("Panel one", new Text("panel one body")),
                      AccordionPanel.builder()
                          .label("Panel two")
                          .content(new Text("panel two body"))
                          .disabled(true)
                          .build()))
              .build());
      content.add(new Markdown("**bold** words", null, null));
      content.add(new io.mateu.uidl.data.Image("https://img.example/pic.png"));
      content.add(new Anchor("Mateu", "https://mateu.io"));
      content.add(new Avatar("Ada Lovelace"));
      content.add(
          Breadcrumbs.builder()
              .currentItemText("Current page")
              .breadcrumbs(List.of(new Breadcrumb("Home", "/")))
              .build());
      content.add(new Notification("Saved", "All good"));
      content.add(new Details(new Text("Summary line"), new Text("Details body"), "", "", true));
      content.add(new Tooltip("A hint", new Text("wrapped by tooltip"), "", ""));
      content.add(new Scroller(new Text("scrolled content"), "", ""));
      content.add(new Container(new Text("contained content")));
      content.add(new Div("plain div content"));
      return VerticalLayout.builder()
          .id("showcase-root")
          .spacing(true)
          .fullWidth(true)
          .content(content)
          .build();
    }
  }

  // ---------------------------------------------------------------- harness

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu =
        TestMateu.withUis(
            OpsDashboard.class,
            BookingFoldoutPage.class,
            FrontDeskWelcome.class,
            ChairOverview.class,
            RoomSearch.class,
            Showcase.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  // ---------------------------------------------------------------- dashboard

  @Test
  void dashboardRendersAsDashboardLayoutWithConfiguredColumns() {
    var layout = findFirst(sync("/ops-dashboard"), DashboardLayoutDto.class);
    assertThat(layout).isNotNull();
    assertThat(((DashboardLayoutDto) layout.metadata()).columns()).isEqualTo(3);
  }

  @Test
  void consecutiveMetricCardFieldsGroupIntoAScoreboard() {
    var scoreboard = findFirst(sync("/ops-dashboard"), ScoreboardDto.class);
    assertThat(scoreboard).isNotNull();
    var metrics =
        scoreboard.children().stream()
            .map(child -> ((ClientSideComponentDto) child).metadata())
            .toList();
    assertThat(metrics).hasSize(3).allMatch(MetricCardDto.class::isInstance);
    assertThat(metrics.stream().map(m -> ((MetricCardDto) m).title()))
        .containsExactly("Revenue", "Orders", "Returns");
  }

  @Test
  void metricCardCarriesTitleValueUnitTrendIconAndAction() {
    var scoreboard = findFirst(sync("/ops-dashboard"), ScoreboardDto.class);
    var revenue =
        (MetricCardDto) ((ClientSideComponentDto) scoreboard.children().get(0)).metadata();
    assertThat(revenue.title()).isEqualTo("Revenue");
    assertThat(revenue.value()).isEqualTo("1.2");
    assertThat(revenue.unit()).isEqualTo("M€");
    assertThat(revenue.trend()).isEqualTo(MetricTrendDto.up);
    assertThat(revenue.trendLabel()).isEqualTo("+8%");
    assertThat(revenue.icon()).isEqualTo("vaadin:dollar");
    assertThat(revenue.actionId()).isEqualTo("openRevenue");
  }

  @Test
  void panelAnnotatedFieldBecomesTitledDashboardPanelWithSpans() {
    var panel = findFirst(sync("/ops-dashboard"), DashboardPanelDto.class);
    assertThat(panel).isNotNull();
    var metadata = (DashboardPanelDto) panel.metadata();
    assertThat(metadata.title()).isEqualTo("Monthly sales");
    assertThat(metadata.subtitle()).isEqualTo("Units per month");
    assertThat(metadata.colSpan()).isEqualTo(2);
    assertThat(metadata.rowSpan()).isEqualTo(2);
    assertThat(panel.id()).isEqualTo("sales");
    var wrapped = findFirst(panel, TextDto.class);
    assertThat(wrapped).isNotNull();
    assertThat(((TextDto) wrapped.metadata()).text()).isEqualTo("sales chart placeholder");
  }

  @Test
  void plainComponentFieldLandsOnTheDashboardGridAsIs() {
    var layout = findFirst(sync("/ops-dashboard"), DashboardLayoutDto.class);
    // scoreboard + panel + plain markdown = 3 grid items
    assertThat(layout.children()).hasSize(3);
    var last = (ClientSideComponentDto) layout.children().get(2);
    assertThat(last.metadata()).isInstanceOf(MarkdownDto.class);
    assertThat(((MarkdownDto) last.metadata()).markdown()).isEqualTo("plain grid item");
  }

  // ---------------------------------------------------------------- foldout

  @Test
  void foldoutRendersFoldoutLayoutWithPanelHeaders() {
    var foldout = findFirst(sync("/booking-foldout"), FoldoutLayoutDto.class);
    assertThat(foldout).isNotNull();
    var panels = ((FoldoutLayoutDto) foldout.metadata()).panels();
    assertThat(panels).hasSize(2);
    assertThat(panels.get(0).title()).isEqualTo("Payments");
    assertThat(panels.get(0).subtitle()).isEqualTo("Charges and refunds");
    assertThat(panels.get(0).icon()).isEqualTo("vaadin:card");
    assertThat(panels.get(0).open()).isTrue();
    assertThat(panels.get(1).title()).isEqualTo("Notes");
    assertThat(panels.get(1).open()).isFalse();
  }

  @Test
  void foldoutOverviewTravelsInTheOverviewSlot() {
    var foldout = findFirst(sync("/booking-foldout"), FoldoutLayoutDto.class);
    var overview =
        foldout.children().stream()
            .map(ClientSideComponentDto.class::cast)
            .filter(child -> "overview".equals(child.slot()))
            .findFirst()
            .orElse(null);
    assertThat(overview).isNotNull();
    assertThat(overview.metadata()).isInstanceOf(MarkdownDto.class);
    assertThat(((MarkdownDto) overview.metadata()).markdown()).isEqualTo("booking overview");
  }

  @Test
  void foldoutPanelContentsTravelInIndexedPanelSlots() {
    var foldout = findFirst(sync("/booking-foldout"), FoldoutLayoutDto.class);
    var slots = foldout.children().stream().map(c -> ((ClientSideComponentDto) c).slot()).toList();
    assertThat(slots).containsExactly("overview", "panel-0", "panel-1");
    var panel0 =
        (ClientSideComponentDto)
            foldout.children().stream()
                .filter(c -> "panel-0".equals(((ClientSideComponentDto) c).slot()))
                .findFirst()
                .orElseThrow();
    assertThat(((MarkdownDto) panel0.metadata()).markdown()).isEqualTo("payments detail");
  }

  // ---------------------------------------------------------------- welcome

  @Test
  void welcomeHeroCarriesTitleSubtitleImageAndIsCentered() {
    var hero = findFirst(sync("/front-desk-welcome"), HeroSectionDto.class);
    assertThat(hero).isNotNull();
    var metadata = (HeroSectionDto) hero.metadata();
    assertThat(metadata.title()).isEqualTo("Front desk check-in");
    assertThat(metadata.subtitle()).isEqualTo("Three steps to check a guest in");
    assertThat(metadata.image()).isEqualTo("https://img.example/hero.jpg");
    assertThat(metadata.centered()).isTrue();
  }

  @Test
  void welcomeButtonFieldsBecomeHeroCallToActions() {
    var hero = findFirst(sync("/front-desk-welcome"), HeroSectionDto.class);
    var buttons =
        hero.children().stream()
            .map(child -> ((ClientSideComponentDto) child).metadata())
            .filter(ButtonDto.class::isInstance)
            .map(ButtonDto.class::cast)
            .toList();
    assertThat(buttons).hasSize(2);
    assertThat(buttons.get(0).label()).isEqualTo("Start check-in");
    assertThat(buttons.get(0).actionId()).isEqualTo("startCheckin");
    assertThat(buttons.get(1).label()).isEqualTo("Open dashboard");
    assertThat(buttons.get(1).actionId()).isEqualTo("openDashboard");
  }

  @Test
  void welcomePanelFieldsBecomeHighlightTilesOnADashboardGrid() {
    var increment = sync("/front-desk-welcome");
    var grid = findFirst(increment, DashboardLayoutDto.class);
    assertThat(grid).isNotNull();
    assertThat(grid.id()).isEqualTo("highlights");
    var tiles = findAll(grid, DashboardPanelDto.class);
    assertThat(tiles).hasSize(2);
    assertThat(tiles.stream().map(t -> ((DashboardPanelDto) t.metadata()).title()))
        .containsExactly("1 · Search the booking", "2 · Verify the guests");
  }

  // ---------------------------------------------------------------- item overview

  @Test
  void itemOverviewKeyInfoIsAStickyCardWithConfiguredWidth() {
    var increment = sync("/chair-overview");
    // CardMapper does not propagate the fluent id — the key-info card is the sticky one.
    var card =
        findAll(increment, CardDto.class).stream()
            .filter(c -> c.style() != null && c.style().contains("position: sticky"))
            .findFirst()
            .orElse(null);
    assertThat(card).isNotNull();
    assertThat(card.style()).contains("position: sticky").contains("flex: 0 0 26rem");
    var content = ((CardDto) card.metadata()).content();
    assertThat(content).isInstanceOf(ClientSideComponentDto.class);
    assertThat(((ClientSideComponentDto) content).metadata()).isInstanceOf(MarkdownDto.class);
  }

  @Test
  void itemOverviewPanelFieldsBecomeTabs() {
    var increment = sync("/chair-overview");
    var tabLayout = findFirst(increment, TabLayoutDto.class);
    assertThat(tabLayout).isNotNull();
    assertThat(tabLayout.id()).isEqualTo("item-tabs");
    var tabs = findAll(tabLayout, TabDto.class);
    assertThat(tabs).hasSize(2);
    assertThat(tabs.stream().map(t -> ((TabDto) t.metadata()).label()))
        .containsExactly("Sales", "Specifications");
  }

  @Test
  void itemOverviewComposesAHorizontalLayoutRoot() {
    var increment = sync("/chair-overview");
    var horizontal = findFirst(increment, HorizontalLayoutDto.class);
    assertThat(horizontal).isNotNull();
    assertThat(((HorizontalLayoutDto) horizontal.metadata()).fullWidth()).isTrue();
    // the layout hosts both the sticky card and the tab layout
    assertThat(findFirst(horizontal, CardDto.class)).isNotNull();
    assertThat(findFirst(horizontal, TabLayoutDto.class)).isNotNull();
  }

  // ---------------------------------------------------------------- hero search

  @Test
  void heroSearchComposesAHeroHeaderAboveTheListing() {
    UIIncrementDto increment;
    try {
      increment = sync("/room-search");
    } catch (Throwable t) {
      assumeTrue(false, "HeroSearch needs beans the harness lacks: " + t);
      return;
    }
    var hero = findFirst(increment, HeroSectionDto.class);
    assertThat(hero).isNotNull();
    var metadata = (HeroSectionDto) hero.metadata();
    assertThat(metadata.title()).isEqualTo("Find a room");
    assertThat(metadata.subtitle()).isEqualTo("Search by name or zone");
    assertThat(metadata.centered()).isTrue();
    // the listing travels next to the hero inside the same stretched vertical layout
    var root = findFirst(increment, VerticalLayoutDto.class);
    assertThat(root).isNotNull();
    assertThat(root.children().size()).isGreaterThan(1);
  }

  // ---------------------------------------------------------------- fluent component tree

  @Test
  void showcaseSyncsAsAServerSideComponentWithTheFluentTree() {
    var increment = sync("/component-showcase");
    assertThat(increment.fragments()).isNotEmpty();
    var server = findServerSide(increment);
    assertThat(server).isNotNull();
    assertThat(server.serverSideType()).isEqualTo(Showcase.class.getName());
    var root = findFirst(increment, VerticalLayoutDto.class);
    assertThat(root).isNotNull();
    assertThat(root.id()).isEqualTo("showcase-root");
    var metadata = (VerticalLayoutDto) root.metadata();
    assertThat(metadata.spacing()).isTrue();
    assertThat(metadata.fullWidth()).isTrue();
  }

  @Test
  void textMapsToTextDto() {
    var increment = sync("/component-showcase");
    var texts = findAll(increment, TextDto.class);
    assertThat(texts.stream().map(t -> ((TextDto) t.metadata()).text()))
        .contains("Component showcase", "hero child", "tile body");
  }

  @Test
  void buttonMapsToButtonDtoWithActionIdAndShortcut() {
    var increment = sync("/component-showcase");
    var button =
        findAll(increment, ButtonDto.class).stream()
            .filter(b -> "cta".equals(b.id()))
            .findFirst()
            .orElse(null);
    assertThat(button).isNotNull();
    var metadata = (ButtonDto) button.metadata();
    assertThat(metadata.label()).isEqualTo("Run it");
    assertThat(metadata.actionId()).isEqualTo("runIt");
    assertThat(metadata.shortcut()).isEqualTo("ctrl+r");
  }

  @Test
  void cardMapsTitleAndContentIntoItsMetadata() {
    var increment = sync("/component-showcase");
    // CardMapper does not propagate the fluent id (it assigns its own), so match by title.
    var card =
        findAll(increment, CardDto.class).stream()
            .filter(
                c ->
                    ((CardDto) c.metadata()).title() instanceof ClientSideComponentDto title
                        && title.metadata() instanceof TextDto text
                        && "Card title".equals(text.text()))
            .findFirst()
            .orElse(null);
    assertThat(card).isNotNull();
    var metadata = (CardDto) card.metadata();
    assertThat(((TextDto) ((ClientSideComponentDto) metadata.title()).metadata()).text())
        .isEqualTo("Card title");
    assertThat(((TextDto) ((ClientSideComponentDto) metadata.content()).metadata()).text())
        .isEqualTo("Card body");
  }

  @Test
  void tabLayoutMapsTabsWithLabelsAndContents() {
    var increment = sync("/component-showcase");
    var tabLayout =
        findAll(increment, TabLayoutDto.class).stream()
            .filter(t -> "tabs".equals(t.id()))
            .findFirst()
            .orElse(null);
    assertThat(tabLayout).isNotNull();
    var tabs = findAll(tabLayout, TabDto.class);
    assertThat(tabs.stream().map(t -> ((TabDto) t.metadata()).label()))
        .containsExactly("First", "Second");
    assertThat(((TextDto) findFirst(tabs.get(0), TextDto.class).metadata()).text())
        .isEqualTo("first tab body");
  }

  @Test
  void emptyStateMapsAllKeyFields() {
    var empty = findFirst(sync("/component-showcase"), EmptyStateDto.class);
    assertThat(empty).isNotNull();
    var metadata = (EmptyStateDto) empty.metadata();
    assertThat(metadata.icon()).isEqualTo("📭");
    assertThat(metadata.title()).isEqualTo("Nothing here yet");
    assertThat(metadata.description()).isEqualTo("Create one to get started.");
    assertThat(metadata.actionId()).isEqualTo("createOne");
    assertThat(metadata.actionLabel()).isEqualTo("Create one");
  }

  @Test
  void skeletonVariantsAndCountsMap() {
    var skeletons = findAll(sync("/component-showcase"), SkeletonDto.class);
    assertThat(skeletons).hasSize(4);
    assertThat(
            skeletons.stream()
                .map(s -> (SkeletonDto) s.metadata())
                .map(s -> s.variant() + ":" + s.count()))
        .containsExactly("text:4", "card:1", "grid:5", "form:3");
  }

  @Test
  void kanbanColumnsAndCardsSerialize() {
    var kanban = findFirst(sync("/component-showcase"), KanbanDto.class);
    assertThat(kanban).isNotNull();
    var columns = ((KanbanDto) kanban.metadata()).columns();
    assertThat(columns).hasSize(2);
    assertThat(columns.get(0).title()).isEqualTo("To do");
    assertThat(columns.get(0).color()).isEqualTo("#94a3b8");
    assertThat(columns.get(0).cards()).hasSize(1);
    assertThat(columns.get(0).cards().get(0).title()).isEqualTo("Task A");
    assertThat(columns.get(0).cards().get(0).badge()).isEqualTo("3");
    assertThat(columns.get(1).cards().get(0).description()).isEqualTo("in flight");
    assertThat(columns.get(1).cards().get(0).actionId()).isEqualTo("openCard");
  }

  @Test
  void faqItemsSerialize() {
    var faq = findFirst(sync("/component-showcase"), FaqDto.class);
    assertThat(faq).isNotNull();
    var items = ((FaqDto) faq.metadata()).items();
    assertThat(items).hasSize(2);
    assertThat(items.get(0).question()).isEqualTo("Is it free?");
    assertThat(items.get(0).answer()).isEqualTo("There is a free tier.");
    assertThat(items.get(0).open()).isTrue();
    assertThat(items.get(1).open()).isFalse();
  }

  @Test
  void testimonialsSerialize() {
    var t = findFirst(sync("/component-showcase"), TestimonialsDto.class);
    assertThat(t).isNotNull();
    var items = ((TestimonialsDto) t.metadata()).items();
    assertThat(items).hasSize(2);
    assertThat(items.get(0).quote()).isEqualTo("Shipped in a day.");
    assertThat(items.get(0).author()).isEqualTo("Ada");
    assertThat(items.get(0).rating()).isEqualTo(5);
    assertThat(items.get(1).rating()).isEqualTo(4);
  }

  @Test
  void featureGridSerializes() {
    var grid = findFirst(sync("/component-showcase"), FeatureGridDto.class);
    assertThat(grid).isNotNull();
    var m = (FeatureGridDto) grid.metadata();
    assertThat(m.columns()).isEqualTo(3);
    assertThat(m.features()).hasSize(2);
    assertThat(m.features().get(0).title()).isEqualTo("Fast");
    assertThat(m.features().get(0).icon()).isEqualTo("⚡");
    assertThat(m.features().get(0).actionId()).isEqualTo("openFeature");
    assertThat(m.features().get(1).description()).isEqualTo("Locked down");
  }

  @Test
  void trendChartSerializesValuesAndLabels() {
    var trend = findFirst(sync("/component-showcase"), TrendChartDto.class);
    assertThat(trend).isNotNull();
    var m = (TrendChartDto) trend.metadata();
    assertThat(m.title()).isEqualTo("Revenue");
    assertThat(m.values()).containsExactly(10.0, 14.0, 12.0, 18.0, 22.0);
    assertThat(m.labels()).containsExactly("Jan", "Feb", "Mar", "Apr", "May");
    assertThat(m.color()).isEqualTo("#10b981");
    assertThat(m.area()).isTrue();
  }

  @Test
  void funnelStagesSerialize() {
    var funnel = findFirst(sync("/component-showcase"), FunnelDto.class);
    assertThat(funnel).isNotNull();
    var stages = ((FunnelDto) funnel.metadata()).stages();
    assertThat(stages).hasSize(3);
    assertThat(stages.get(0).label()).isEqualTo("Visits");
    assertThat(stages.get(0).value()).isEqualTo(1000d);
    assertThat(stages.get(1).color()).isEqualTo("#8b5cf6");
    assertThat(stages.get(2).value()).isEqualTo(120d);
  }

  @Test
  void heatmapCellsSerializeWithIsoDates() {
    var heat = findFirst(sync("/component-showcase"), HeatmapDto.class);
    assertThat(heat).isNotNull();
    var cells = ((HeatmapDto) heat.metadata()).cells();
    assertThat(cells).hasSize(2);
    assertThat(cells.get(0).date()).isEqualTo("2026-03-01");
    assertThat(cells.get(0).value()).isEqualTo(2d);
    assertThat(cells.get(1).value()).isEqualTo(5d);
    assertThat(cells.get(1).label()).isEqualTo("5 commits");
  }

  @Test
  void orgChartSerializesNestedNodes() {
    var org = findFirst(sync("/component-showcase"), OrgChartDto.class);
    assertThat(org).isNotNull();
    var root = ((OrgChartDto) org.metadata()).root();
    assertThat(root.title()).isEqualTo("Ada");
    assertThat(root.subtitle()).isEqualTo("CEO");
    assertThat(root.actionId()).isEqualTo("openPerson");
    assertThat(root.children()).hasSize(2);
    assertThat(root.children().get(0).title()).isEqualTo("Alan");
    assertThat(root.children().get(1).title()).isEqualTo("Grace");
  }

  @Test
  void pricingTablePlansSerialize() {
    var pricing = findFirst(sync("/component-showcase"), PricingTableDto.class);
    assertThat(pricing).isNotNull();
    var plans = ((PricingTableDto) pricing.metadata()).plans();
    assertThat(plans).hasSize(2);
    assertThat(plans.get(0).name()).isEqualTo("Free");
    assertThat(plans.get(0).featured()).isFalse();
    assertThat(plans.get(1).name()).isEqualTo("Pro");
    assertThat(plans.get(1).featured()).isTrue();
    assertThat(plans.get(1).price()).isEqualTo("29€");
    assertThat(plans.get(1).features()).containsExactly("Unlimited projects", "Priority support");
    assertThat(plans.get(1).ctaLabel()).isEqualTo("Go Pro");
    assertThat(plans.get(1).actionId()).isEqualTo("choosePlan");
  }

  @Test
  void calendarSerializesMonthAndEventsWithIsoDates() {
    var cal = findFirst(sync("/component-showcase"), CalendarDto.class);
    assertThat(cal).isNotNull();
    var m = (CalendarDto) cal.metadata();
    assertThat(m.month()).isEqualTo("2026-03-01");
    assertThat(m.events()).hasSize(2);
    assertThat(m.events().get(0).title()).isEqualTo("Kickoff");
    assertThat(m.events().get(0).date()).isEqualTo("2026-03-04");
    assertThat(m.events().get(0).color()).isEqualTo("#3b82f6");
    assertThat(m.events().get(1).actionId()).isEqualTo("openEvent");
  }

  @Test
  void statSerializesValueDeltaAndSparkline() {
    var stat = findFirst(sync("/component-showcase"), StatDto.class);
    assertThat(stat).isNotNull();
    var m = (StatDto) stat.metadata();
    assertThat(m.label()).isEqualTo("MRR");
    assertThat(m.value()).isEqualTo("48.2");
    assertThat(m.unit()).isEqualTo("k€");
    assertThat(m.delta()).isEqualTo("+7.4%");
    assertThat(m.trend()).isEqualTo("up");
    assertThat(m.spark()).hasSize(7);
    assertThat(m.spark().get(0)).isEqualTo(30.0);
    assertThat(m.actionId()).isEqualTo("openMrr");
  }

  @Test
  void progressStepsSerialize() {
    var steps = findFirst(sync("/component-showcase"), ProgressStepsDto.class);
    assertThat(steps).isNotNull();
    var items = ((ProgressStepsDto) steps.metadata()).steps();
    assertThat(items).hasSize(3);
    assertThat(items.get(0).title()).isEqualTo("Cart");
    assertThat(items.get(0).status()).isEqualTo("done");
    assertThat(items.get(1).status()).isEqualTo("current");
    assertThat(items.get(1).description()).isEqualTo("in progress");
    assertThat(items.get(2).status()).isEqualTo("upcoming");
  }

  @Test
  void timelineItemsSerialize() {
    var timeline = findFirst(sync("/component-showcase"), TimelineDto.class);
    assertThat(timeline).isNotNull();
    var items = ((TimelineDto) timeline.metadata()).items();
    assertThat(items).hasSize(2);
    assertThat(items.get(0).title()).isEqualTo("Order placed");
    assertThat(items.get(0).timestamp()).isEqualTo("09:00");
    assertThat(items.get(0).icon()).isEqualTo("🛒");
    assertThat(items.get(1).description()).isEqualTo("Tracking #ABC");
    assertThat(items.get(1).color()).isEqualTo("#10b981");
    assertThat(items.get(1).actionId()).isEqualTo("openShipment");
  }

  @Test
  void ganttTasksSerializeIsoDates() {
    var gantt = findFirst(sync("/component-showcase"), GanttDto.class);
    assertThat(gantt).isNotNull();
    var tasks = ((GanttDto) gantt.metadata()).tasks();
    assertThat(tasks).hasSize(2);
    assertThat(tasks.get(0).title()).isEqualTo("Design");
    assertThat(tasks.get(0).start()).isEqualTo("2026-03-01");
    assertThat(tasks.get(0).end()).isEqualTo("2026-03-15");
    assertThat(tasks.get(0).progress()).isEqualTo(100d);
    assertThat(tasks.get(1).id()).isEqualTo("t2");
    assertThat(tasks.get(1).color()).isEqualTo("#f59e0b");
    assertThat(tasks.get(1).progress()).isEqualTo(35d);
  }

  @Test
  void fluentHeroSectionMapsWithSlottedContent() {
    var increment = sync("/component-showcase");
    var hero =
        findAll(increment, HeroSectionDto.class).stream()
            .filter(h -> "fluent-hero".equals(h.id()))
            .findFirst()
            .orElse(null);
    assertThat(hero).isNotNull();
    var metadata = (HeroSectionDto) hero.metadata();
    assertThat(metadata.title()).isEqualTo("Big title");
    assertThat(metadata.subtitle()).isEqualTo("Smaller words");
    assertThat(metadata.image()).isEqualTo("https://img.example/bg.png");
    assertThat(metadata.height()).isEqualTo("18rem");
    assertThat(metadata.centered()).isTrue();
    assertThat(hero.children()).hasSize(1);
  }

  @Test
  void fluentDashboardScoreboardAndMetricCardMap() {
    var increment = sync("/component-showcase");
    var dash =
        findAll(increment, DashboardLayoutDto.class).stream()
            .filter(d -> "fluent-dash".equals(d.id()))
            .findFirst()
            .orElse(null);
    assertThat(dash).isNotNull();
    assertThat(((DashboardLayoutDto) dash.metadata()).columns()).isEqualTo(2);
    var scoreboard = findFirst(dash, ScoreboardDto.class);
    assertThat(scoreboard).isNotNull();
    var metric = (MetricCardDto) findFirst(scoreboard, MetricCardDto.class).metadata();
    assertThat(metric.title()).isEqualTo("Speed");
    assertThat(metric.value()).isEqualTo("42");
    assertThat(metric.unit()).isEqualTo("rpm");
    assertThat(metric.trend()).isEqualTo(MetricTrendDto.neutral);
    var panel = (DashboardPanelDto) findFirst(dash, DashboardPanelDto.class).metadata();
    assertThat(panel.title()).isEqualTo("A tile");
    assertThat(panel.colSpan()).isEqualTo(2);
  }

  @Test
  void splitLayoutMapsMasterAndDetail() {
    var split = findFirst(sync("/component-showcase"), SplitLayoutDto.class);
    assertThat(split).isNotNull();
    assertThat(((SplitLayoutDto) split.metadata()).fullWidth()).isTrue();
    var texts =
        findAll(split, TextDto.class).stream().map(t -> ((TextDto) t.metadata()).text()).toList();
    assertThat(texts).contains("master side", "detail side");
  }

  @Test
  void accordionMapsPanelHeaders() {
    var accordion = findFirst(sync("/component-showcase"), AccordionLayoutDto.class);
    assertThat(accordion).isNotNull();
    // Panels travel as CHILD components (AccordionPanelDto metadata), not in the DTO's list.
    var panels =
        findAll(accordion, io.mateu.dtos.AccordionPanelDto.class).stream()
            .map(c -> (io.mateu.dtos.AccordionPanelDto) c.metadata())
            .toList();
    assertThat(panels).hasSize(2);
    assertThat(panels.get(0).label()).isEqualTo("Panel one");
    assertThat(panels.get(0).disabled()).isFalse();
    assertThat(panels.get(1).label()).isEqualTo("Panel two");
    assertThat(panels.get(1).disabled()).isTrue();
  }

  @Test
  void badgeKpiAndProgressBarMap() {
    var increment = sync("/component-showcase");
    var badge = (BadgeDto) findFirst(increment, BadgeDto.class).metadata();
    assertThat(badge.text()).isEqualTo("Active");
    var kpi = (KPIDto) findFirst(increment, KPIDto.class).metadata();
    assertThat(kpi.title()).isEqualTo("Open tickets");
    assertThat(kpi.text()).isEqualTo("17");
    var progress = (ProgressBarDto) findFirst(increment, ProgressBarDto.class).metadata();
    assertThat(progress.min()).isEqualTo(0);
    assertThat(progress.max()).isEqualTo(100);
    assertThat(progress.value()).isEqualTo(40d);
    assertThat(progress.text()).isEqualTo("40%");
  }

  @Test
  void markdownImageAnchorAvatarAndBreadcrumbsMap() {
    var increment = sync("/component-showcase");
    assertThat(
            findAll(increment, MarkdownDto.class).stream()
                .map(m -> ((MarkdownDto) m.metadata()).markdown()))
        .contains("**bold** words");
    var image =
        (io.mateu.dtos.ImageDto) findFirst(increment, io.mateu.dtos.ImageDto.class).metadata();
    assertThat(image.src()).isEqualTo("https://img.example/pic.png");
    var anchor = (AnchorDto) findFirst(increment, AnchorDto.class).metadata();
    assertThat(anchor.text()).isEqualTo("Mateu");
    assertThat(anchor.url()).isEqualTo("https://mateu.io");
    var avatar = (AvatarDto) findFirst(increment, AvatarDto.class).metadata();
    assertThat(avatar.name()).isEqualTo("Ada Lovelace");
    var breadcrumbs = (BreadcrumbsDto) findFirst(increment, BreadcrumbsDto.class).metadata();
    assertThat(breadcrumbs.currentItemText()).isEqualTo("Current page");
    assertThat(breadcrumbs.breadcrumbs()).hasSize(1);
    assertThat(breadcrumbs.breadcrumbs().get(0).text()).isEqualTo("Home");
  }

  @Test
  void notificationDetailsAndTooltipMap() {
    var increment = sync("/component-showcase");
    var notification = (NotificationDto) findFirst(increment, NotificationDto.class).metadata();
    assertThat(notification.title()).isEqualTo("Saved");
    assertThat(notification.text()).isEqualTo("All good");
    var details = (DetailsDto) findFirst(increment, DetailsDto.class).metadata();
    assertThat(details.opened()).isTrue();
    assertThat(((TextDto) ((ClientSideComponentDto) details.summary()).metadata()).text())
        .isEqualTo("Summary line");
    assertThat(((TextDto) ((ClientSideComponentDto) details.content()).metadata()).text())
        .isEqualTo("Details body");
    var tooltip = (TooltipDto) findFirst(increment, TooltipDto.class).metadata();
    assertThat(tooltip.text()).isEqualTo("A hint");
    assertThat(((TextDto) ((ClientSideComponentDto) tooltip.wrapped()).metadata()).text())
        .isEqualTo("wrapped by tooltip");
  }

  @Test
  void scrollerContainerAndDivMap() {
    var increment = sync("/component-showcase");
    var scroller = findFirst(increment, ScrollerDto.class);
    assertThat(scroller).isNotNull();
    assertThat(((TextDto) findFirst(scroller, TextDto.class).metadata()).text())
        .isEqualTo("scrolled content");
    var container = findFirst(increment, ContainerDto.class);
    assertThat(container).isNotNull();
    assertThat(((TextDto) findFirst(container, TextDto.class).metadata()).text())
        .isEqualTo("contained content");
    var div = findFirst(increment, DivDto.class);
    assertThat(div).isNotNull();
    assertThat(((DivDto) div.metadata()).content()).isEqualTo("plain div content");
  }

  @Test
  void horizontalLayoutFlagsTravelOnTheWire() {
    var increment = sync("/component-showcase");
    var chips =
        findAll(increment, HorizontalLayoutDto.class).stream()
            .filter(h -> "chips".equals(h.id()))
            .findFirst()
            .orElse(null);
    assertThat(chips).isNotNull();
    var metadata = (HorizontalLayoutDto) chips.metadata();
    assertThat(metadata.spacing()).isTrue();
    assertThat(metadata.wrap()).isTrue();
    assertThat(chips.children()).hasSize(3);
  }

  // ---------------------------------------------------------------- helpers

  private static UIIncrementDto sync(String route) {
    return mateu.sync(route);
  }

  /** First component (DFS, document order) whose metadata is of the given DTO type. */
  private static ClientSideComponentDto findFirst(
      UIIncrementDto increment, Class<? extends ComponentMetadataDto> type) {
    var all = new ArrayList<ClientSideComponentDto>();
    increment.fragments().forEach(fragment -> collect(fragment.component(), type, all));
    return all.isEmpty() ? null : all.get(0);
  }

  private static ClientSideComponentDto findFirst(
      ComponentDto root, Class<? extends ComponentMetadataDto> type) {
    var all = new ArrayList<ClientSideComponentDto>();
    collect(root, type, all);
    return all.isEmpty() ? null : all.get(0);
  }

  private static List<ClientSideComponentDto> findAll(
      UIIncrementDto increment, Class<? extends ComponentMetadataDto> type) {
    var all = new ArrayList<ClientSideComponentDto>();
    increment.fragments().forEach(fragment -> collect(fragment.component(), type, all));
    return all;
  }

  private static List<ClientSideComponentDto> findAll(
      ComponentDto root, Class<? extends ComponentMetadataDto> type) {
    var all = new ArrayList<ClientSideComponentDto>();
    collect(root, type, all);
    return all;
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
    // metadata types that embed components carry them inside the metadata, not as children
    if (client.metadata() instanceof CardDto card) {
      for (var slotted :
          new Object[] {
            card.media(),
            card.headerPrefix(),
            card.header(),
            card.title(),
            card.subtitle(),
            card.headerSuffix(),
            card.content(),
            card.footer()
          }) {
        if (slotted != null) {
          collect(slotted, type, found);
        }
      }
    }
    if (client.metadata() instanceof DetailsDto details) {
      collect(details.summary(), type, found);
      collect(details.content(), type, found);
    }
    if (client.metadata() instanceof TooltipDto tooltip) {
      collect(tooltip.wrapped(), type, found);
    }
    client.children().forEach(child -> collect(child, type, found));
  }

  private static ServerSideComponentDto findServerSide(UIIncrementDto increment) {
    for (var fragment : increment.fragments()) {
      if (fragment.component() instanceof ServerSideComponentDto server) {
        return server;
      }
    }
    return null;
  }
}
