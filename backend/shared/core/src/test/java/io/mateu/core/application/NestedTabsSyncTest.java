package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.ComponentMetadataDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.dtos.TabDto;
import io.mateu.dtos.TabLayoutDto;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Tab;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.TabLayout;
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
 * Nested tabs (a tab strip inside a tab), declarative and fluent: the structure nests (TabLayout >
 * Tab > … > TabLayout > Tab) and every strip carries its own id, so renderers can keep the strips —
 * and the active tab of each — apart.
 */
class NestedTabsSyncTest {

  // ---------------------------------------------------------------- fixtures

  /** Declarative: a @Tab field whose type has its own @Tab fields. */
  @SuppressWarnings("unused")
  @UI("/nested-tabs")
  public static class Customer {
    @Tab("General")
    String name = "Ana";

    @Tab("Details")
    Details details = new Details();
  }

  @SuppressWarnings("unused")
  public static class Details {
    // same label as the outer strip on purpose: label-based ids collided
    @Tab("General")
    String phone = "600";

    @Tab("Notes")
    String notes = "vip";
  }

  /** Two @Section with their own @Tab fields: sibling strips at the same level. */
  @SuppressWarnings("unused")
  @UI("/sibling-tabs")
  public static class Sectioned {
    @Section("One")
    @Tab("A")
    String a = "1";

    @Tab("B")
    String b = "2";

    @Section("Two")
    @Tab("C")
    String c = "3";

    @Tab("D")
    String d = "4";
  }

  /** Fluent: a Tab whose content is another TabLayout. */
  @UI("/fluent-nested-tabs")
  public static class FluentNested implements ComponentTreeSupplier {
    @Override
    public Component component(HttpRequest httpRequest) {
      return TabLayout.builder()
          .id("outer")
          .tabs(
              List.of(
                  new io.mateu.uidl.data.Tab("General", new Text("outer general")),
                  new io.mateu.uidl.data.Tab(
                      "Details",
                      TabLayout.builder()
                          .id("inner")
                          .tabs(
                              List.of(
                                  new io.mateu.uidl.data.Tab("General", new Text("inner general")),
                                  new io.mateu.uidl.data.Tab("Notes", new Text("inner notes"))))
                          .build())))
          .build();
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(Customer.class, Sectioned.class, FluentNested.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  // ---------------------------------------------------------------- tests

  @Test
  void declarativeNestedTabsNestAndCarryDistinctIds() {
    var strips = strips(mateu.sync("/nested-tabs").fragments().get(0).component());
    assertThat(strips).hasSize(2);

    var outer = strips.get(0);
    assertThat(outer.id()).isEqualTo("_tabs");
    assertThat(labels(outer)).containsExactly("General", "Details");

    var inner = strips.get(1);
    assertThat(inner.id()).isNotEqualTo(outer.id()).isEqualTo("details-_tabs");
    assertThat(labels(inner)).containsExactly("General", "Notes");

    // the inner strip lives INSIDE the outer «Details» tab, not next to the outer strip
    var detailsTab = outer.children().get(1);
    assertThat(strips(detailsTab)).containsExactly(inner);
    assertThat(strips(outer.children().get(0))).isEmpty();
  }

  @Test
  void siblingStripsInDifferentSectionsDoNotShareTheId() {
    var strips = strips(mateu.sync("/sibling-tabs").fragments().get(0).component());
    assertThat(strips).extracting(ClientSideComponentDto::id).containsExactly("_tabs", "_tabs-c");
    assertThat(labels(strips.get(0))).containsExactly("A", "B");
    assertThat(labels(strips.get(1))).containsExactly("C", "D");
  }

  @Test
  void fluentTabCanHoldAnotherTabLayout() {
    var strips = strips(mateu.sync("/fluent-nested-tabs").fragments().get(0).component());
    assertThat(strips).extracting(ClientSideComponentDto::id).containsExactly("outer", "inner");
    var outer = strips.get(0);
    assertThat(labels(outer)).containsExactly("General", "Details");
    assertThat(strips(outer.children().get(1))).containsExactly(strips.get(1));
    assertThat(labels(strips.get(1))).containsExactly("General", "Notes");
  }

  // ---------------------------------------------------------------- helpers

  /** Every TabLayout in the tree, in document order (outer before inner). */
  static List<ClientSideComponentDto> strips(ComponentDto root) {
    var found = new ArrayList<ClientSideComponentDto>();
    collect(root, found);
    return found;
  }

  static List<String> labels(ClientSideComponentDto strip) {
    return strip.children().stream()
        .map(tab -> ((TabDto) ((ClientSideComponentDto) tab).metadata()).label())
        .toList();
  }

  private static void collect(Object node, List<ClientSideComponentDto> found) {
    if (node instanceof ClientSideComponentDto client) {
      if (client.metadata() instanceof TabLayoutDto) {
        found.add(client);
      }
      if (client.metadata() != null) {
        collectInMetadata(client.metadata(), found);
      }
      client.children().forEach(child -> collect(child, found));
    } else if (node instanceof ServerSideComponentDto server) {
      server.children().forEach(child -> collect(child, found));
    }
  }

  private static void collectInMetadata(
      ComponentMetadataDto metadata, List<ClientSideComponentDto> found) {
    if (!metadata.getClass().isRecord()) {
      return;
    }
    for (var recordComponent : metadata.getClass().getRecordComponents()) {
      Object value;
      try {
        value = recordComponent.getAccessor().invoke(metadata);
      } catch (ReflectiveOperationException e) {
        throw new AssertionError("cannot read " + recordComponent, e);
      }
      if (value instanceof ComponentDto dto) {
        collect(dto, found);
      } else if (value instanceof List<?> list) {
        list.forEach(item -> collect(item, found));
      }
    }
  }
}
