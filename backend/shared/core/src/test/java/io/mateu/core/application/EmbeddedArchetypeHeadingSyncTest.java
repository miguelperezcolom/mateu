package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.orchestrators.dashboard.Dashboard;
import io.mateu.core.testutil.TestMateu;
import io.mateu.core.testutil.WireWalk;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.dtos.TextContainerDto;
import io.mateu.dtos.TextDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.EmbeddedView;
import io.mateu.uidl.data.MetricCard;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * A composed archetype (a {@code Dashboard}) draws no heading of its own: ROUTED, the web shows its
 * window title above it. EMBEDDED in another page ({@link EmbeddedView}) the window title is the
 * HOST's — the Mateu Explorer's dashboard entry showed "Mateu Explorer" above the museum dashboard.
 * Embedded, the island names itself: its declared {@code @Title} travels as its own heading.
 */
class EmbeddedArchetypeHeadingSyncTest {

  @Title("Museum operations")
  public static class MuseumDashboard extends Dashboard {
    MetricCard visitors = MetricCard.builder().title("Visitors").value("48,210").build();
  }

  public static class UntitledDashboard extends Dashboard {
    MetricCard loans = MetricCard.builder().title("Loans").value("37").build();
  }

  @UI("/embedded-dashboard-host")
  public static class Host implements ComponentTreeSupplier {
    @Override
    public Component component(HttpRequest httpRequest) {
      return new VerticalLayout(
          new Text("The host page"),
          new EmbeddedView(new MuseumDashboard()),
          new EmbeddedView(new UntitledDashboard()));
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(Host.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static ServerSideComponentDto island(UIIncrementDto increment, Class<?> type) {
    return WireWalk.all(increment, ServerSideComponentDto.class).stream()
        .filter(c -> type.getName().equals(c.serverSideType()))
        .findFirst()
        .orElseThrow();
  }

  private static List<TextDto> headings(ServerSideComponentDto island) {
    return WireWalk.all(island, ClientSideComponentDto.class).stream()
        .filter(c -> c.metadata() instanceof TextDto)
        .map(c -> (TextDto) c.metadata())
        .filter(t -> t.container() == TextContainerDto.h2)
        .toList();
  }

  @Test
  void anEmbeddedDashboardCarriesItsOwnTitleAsItsHeading() {
    var island = island(mateu.sync("/embedded-dashboard-host"), MuseumDashboard.class);
    assertThat(island.pageType()).isEqualTo("dashboard");
    assertThat(headings(island)).extracting(TextDto::text).containsExactly("Museum operations");
  }

  @Test
  void anEmbeddedDashboardWithNoDeclaredTitleGetsNoHeading() {
    var island = island(mateu.sync("/embedded-dashboard-host"), UntitledDashboard.class);
    assertThat(headings(island)).isEmpty();
  }
}
