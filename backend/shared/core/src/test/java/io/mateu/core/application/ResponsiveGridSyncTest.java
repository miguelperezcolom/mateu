package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.ResponsiveGridDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.GridTrack;
import io.mateu.uidl.data.ResponsiveGrid;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * One responsive grid as THE layout foundation (coherence-plan #9): the column tracks (sized with
 * the #8 hug/fixed/fill vocabulary) resolve to a CSS grid-template-columns string on the wire, and
 * the children travel as component children. This pins the wire shape; the frontend paints a
 * display:grid (responsiveGridRenderer).
 */
class ResponsiveGridSyncTest {

  @SuppressWarnings("unused")
  @UI("/responsive-grid")
  public static class GridView implements ComponentTreeSupplier {
    @Override
    public Component component(HttpRequest httpRequest) {
      return new ResponsiveGrid(
          "grid",
          List.of(GridTrack.hug(), GridTrack.fill(), GridTrack.fixed("15rem")),
          "1rem",
          List.of(new Text("a", "A"), new Text("b", "B"), new Text("c", "C")),
          null);
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(GridView.class, SpanGridView.class, TemplateView.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @SuppressWarnings("unused")
  @UI("/responsive-grid-span")
  public static class SpanGridView implements ComponentTreeSupplier {
    @Override
    public Component component(HttpRequest httpRequest) {
      // a full-width band (span 2) over two 1fr columns
      return new ResponsiveGrid(
          "grid",
          List.of(GridTrack.fill(), GridTrack.fill()),
          null,
          List.of(new Text("band", "band"), new Text("a", "A"), new Text("b", "B")),
          List.of(2, 1, 1),
          null);
    }
  }

  @SuppressWarnings("unused")
  @UI("/responsive-grid-template")
  public static class TemplateView implements ComponentTreeSupplier {
    @Override
    public Component component(HttpRequest httpRequest) {
      // A Screen = Template + slots (coherence-plan #7): named grid areas, children placed by slot.
      return ResponsiveGrid.template(
          "screen",
          "\"header header\" \"sidebar main\"",
          List.of(
              new io.mateu.uidl.data.Slotted("header", new Text("h", "Header")),
              new io.mateu.uidl.data.Slotted("sidebar", new Text("s", "Sidebar")),
              new io.mateu.uidl.data.Slotted("main", new Text("m", "Main"))));
    }
  }

  @Test
  void aTemplateCarriesItsGridAreasAndPlacesChildrenBySlot() {
    var grid = findGrid(mateu.sync("/responsive-grid-template"));
    assertThat(grid).isNotNull();
    assertThat(((ResponsiveGridDto) grid.metadata()).gridTemplateAreas())
        .isEqualTo("\"header header\" \"sidebar main\"");
    // each child lands in its named slot
    assertThat(grid.children().stream().map(c -> ((ClientSideComponentDto) c).slot()))
        .containsExactly("header", "sidebar", "main");
  }

  @Test
  void perChildColumnSpansTravelOnTheWire() {
    var grid = findGrid(mateu.sync("/responsive-grid-span"));
    var meta = (ResponsiveGridDto) grid.metadata();
    assertThat(meta.colSpans()).containsExactly(2, 1, 1);
  }

  @Test
  void tracksResolveToACssGridTemplateAndChildrenTravel() {
    var grid = findGrid(mateu.sync("/responsive-grid"));
    assertThat(grid).as("the responsive grid is on the wire").isNotNull();
    var meta = (ResponsiveGridDto) grid.metadata();
    assertThat(meta.gridTemplateColumns()).isEqualTo("auto 1fr 15rem");
    assertThat(meta.gap()).isEqualTo("1rem");
    assertThat(grid.children()).hasSize(3);
  }

  private static ClientSideComponentDto findGrid(UIIncrementDto increment) {
    var found = new ArrayList<ClientSideComponentDto>();
    increment.fragments().forEach(f -> collect(f.component(), found));
    return found.isEmpty() ? null : found.get(0);
  }

  private static void collect(ComponentDto node, List<ClientSideComponentDto> found) {
    if (node == null) {
      return;
    }
    if (node instanceof ClientSideComponentDto client
        && client.metadata() instanceof ResponsiveGridDto) {
      found.add(client);
    }
    node.children().forEach(child -> collect(child, found));
  }
}
