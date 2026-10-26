package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.orchestrators.dashboard.Dashboard;
import io.mateu.core.infra.declarative.orchestrators.datamanagement.DataManagement;
import io.mateu.core.infra.declarative.orchestrators.itemoverview.ItemOverview;
import io.mateu.core.infra.declarative.orchestrators.welcome.Welcome;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.ButtonDto;
import io.mateu.dtos.ButtonStyleDto;
import io.mateu.dtos.HeroSectionDto;
import io.mateu.dtos.KPIDto;
import io.mateu.dtos.PageDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.AutoPage;
import io.mateu.uidl.annotations.KPI;
import io.mateu.uidl.annotations.Overline;
import io.mateu.uidl.annotations.Panel;
import io.mateu.uidl.annotations.Subtitle;
import io.mateu.uidl.annotations.Timestamp;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.ButtonStyle;
import io.mateu.uidl.data.MetricCard;
import io.mateu.uidl.data.PeerNav;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.PeerNavigationSupplier;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * The composed archetypes (they build their own tree) carry the canonical page-header pieces a
 * reflected page reads — subtitle, overline, timestamp, KPIs, peer navigation… — when they declare
 * them, inside a page titled like the view unless the tree already names itself; an archetype that
 * declares none renders exactly as before. A {@code Welcome}'s hero takes the page's
 * {@code @Title}/{@code @Subtitle}.
 */
class ArchetypePageHeaderSyncTest {

  @SuppressWarnings("unused")
  @UI("/hdr-plain-dashboard")
  @Title("Plain ops")
  public static class PlainDashboard extends Dashboard {
    MetricCard revenue = MetricCard.builder().title("Revenue").value("1.2").build();
  }

  @SuppressWarnings("unused")
  @UI("/hdr-dashboard")
  @Title("Ops")
  @Subtitle("Today at the front desk")
  @Overline("Hotel Palma")
  public static class HeaderDashboard extends Dashboard {
    MetricCard revenue = MetricCard.builder().title("Revenue").value("1.2").build();

    @KPI String occupancy = "87%";

    @Timestamp("Updated")
    String updated = "10:42";
  }

  @SuppressWarnings("unused")
  @UI("/hdr-item")
  @Title("Product 42")
  public static class PeerItem extends ItemOverview implements PeerNavigationSupplier {
    Text keyInfo = new Text("key", "key info");

    @Panel(title = "Stock")
    Text stock = new Text("stock", "12 units");

    @Override
    public PeerNav peers(HttpRequest httpRequest) {
      return PeerNav.of("/hdr-item/41", "/hdr-item/43");
    }
  }

  @SuppressWarnings("unused")
  @UI("/hdr-dm")
  @Title("Schedule")
  @Subtitle("Week 43")
  public static class SubtitledDataManagement extends DataManagement {
    @Override
    protected Component gridView(HttpRequest httpRequest) {
      return new Text("grid-view", "the grid");
    }

    @Override
    protected Component ganttView(HttpRequest httpRequest) {
      return new Text("gantt-view", "the gantt");
    }
  }

  @SuppressWarnings("unused")
  @UI("/hdr-dm-tx")
  @Title("Replan")
  public static class TransactionalDataManagement extends DataManagement {
    @Override
    protected Component gridView(HttpRequest httpRequest) {
      return new Text("grid-view", "the grid");
    }

    @Override
    protected Component ganttView(HttpRequest httpRequest) {
      return new Text("gantt-view", "the gantt");
    }

    @Toolbar
    public Object cancel() {
      return null;
    }

    @Toolbar(buttonStyle = ButtonStyle.primary)
    public Object publish() {
      return null;
    }
  }

  @SuppressWarnings("unused")
  @UI("/hdr-welcome")
  @Title("Welcome aboard")
  @Subtitle("Start here")
  public static class TitledWelcome extends Welcome {
    Button start = Button.builder().label("Start").actionId("start").build();
  }

  @SuppressWarnings("unused")
  @UI("/hdr-welcome-override")
  @Title("Declared")
  public static class OverriddenWelcome extends Welcome {
    Button start = Button.builder().label("Start").actionId("start").build();

    @Override
    protected String heroTitle() {
      return "Overridden";
    }
  }

  @SuppressWarnings("unused")
  @UI("/hdr-inferred")
  @Title("Inferred ops")
  @Subtitle("From the model")
  @AutoPage
  public static class InferredOps {
    MetricCard revenue = MetricCard.builder().title("Revenue").value("1.2").build();
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu =
        TestMateu.withUis(
            PlainDashboard.class,
            HeaderDashboard.class,
            PeerItem.class,
            SubtitledDataManagement.class,
            TransactionalDataManagement.class,
            TitledWelcome.class,
            OverriddenWelcome.class,
            InferredOps.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static <T> List<T> collect(UIIncrementDto increment, Class<T> type) {
    var out = new ArrayList<T>();
    for (var fragment : increment.fragments()) {
      FieldKindsSyncTest.walk(fragment.component(), type, out);
    }
    return out;
  }

  @Test
  void anArchetypeDeclaringNoHeaderPieceGetsNoPage() {
    assertThat(collect(mateu.sync("/hdr-plain-dashboard"), PageDto.class)).isEmpty();
  }

  @Test
  void aDashboardCarriesItsDeclaredHeaderInAPageTitledLikeTheView() {
    var pages = collect(mateu.sync("/hdr-dashboard"), PageDto.class);
    assertThat(pages).hasSize(1);
    var page = pages.get(0);
    assertThat(page.title()).isEqualTo("Ops");
    assertThat(page.subtitle()).isEqualTo("Today at the front desk");
    assertThat(page.overline()).isEqualTo("Hotel Palma");
    assertThat(page.timestamp()).isEqualTo("Updated 10:42");
    assertThat(page.kpis()).extracting(KPIDto::text).containsExactly("87%");
  }

  @Test
  void anItemOverviewCarriesItsPeerNavigation() {
    var pages = collect(mateu.sync("/hdr-item"), PageDto.class);
    assertThat(pages).hasSize(1);
    assertThat(pages.get(0).peerNav()).isNotNull();
    assertThat(pages.get(0).peerNav().nextRoute()).isEqualTo("/hdr-item/43");
    assertThat(pages.get(0).title()).isEqualTo("Product 42");
  }

  @Test
  void aTreeThatNamesItselfIsNotTitledTwice() {
    var pages = collect(mateu.sync("/hdr-dm"), PageDto.class);
    assertThat(pages).hasSize(1);
    // DataManagement draws its own heading (data-management-title)
    assertThat(pages.get(0).title()).isNull();
    assertThat(pages.get(0).subtitle()).isEqualTo("Week 43");
  }

  @Test
  void aDataManagementDeclaringCancelAndAPrimaryGetsATransactionalHeader() {
    var pages = collect(mateu.sync("/hdr-dm-tx"), PageDto.class);
    assertThat(pages).hasSize(1);
    assertThat(pages.get(0).toolbar())
        .extracting(ButtonDto::actionId, ButtonDto::buttonStyle)
        .containsExactlyInAnyOrder(
            org.assertj.core.groups.Tuple.tuple("cancel", ButtonStyleDto.tertiary),
            org.assertj.core.groups.Tuple.tuple("publish", ButtonStyleDto.primary));
  }

  @Test
  void aWelcomeHeroTakesThePageTitleAndSubtitle() {
    var increment = mateu.sync("/hdr-welcome");
    var heroes = collect(increment, HeroSectionDto.class);
    assertThat(heroes).hasSize(1);
    assertThat(heroes.get(0).title()).isEqualTo("Welcome aboard");
    assertThat(heroes.get(0).subtitle()).isEqualTo("Start here");
    // the hero IS the header: no page around it repeating the subtitle
    assertThat(collect(increment, PageDto.class)).isEmpty();
  }

  @Test
  void anOverriddenHeroTitleWins() {
    var heroes = collect(mateu.sync("/hdr-welcome-override"), HeroSectionDto.class);
    assertThat(heroes.get(0).title()).isEqualTo("Overridden");
  }

  @Test
  void anInferredDashboardCarriesTheModelsHeader() {
    var pages = collect(mateu.sync("/hdr-inferred"), PageDto.class);
    assertThat(pages).hasSize(1);
    assertThat(pages.get(0).title()).isEqualTo("Inferred ops");
    assertThat(pages.get(0).subtitle()).isEqualTo("From the model");
  }
}
