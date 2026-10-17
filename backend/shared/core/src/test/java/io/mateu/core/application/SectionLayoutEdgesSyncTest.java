package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.core.testutil.WireWalk;
import io.mateu.dtos.FormFieldDto;
import io.mateu.dtos.ResponsiveGridDto;
import io.mateu.dtos.TextDto;
import io.mateu.uidl.annotations.Compact;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.annotations.Zone;
import io.mateu.uidl.annotations.Zones;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Section-layout edges: a zone without sections takes no column and a zone without a width fills
 * the rest; a {@code @Compact} page draws its section titles tighter; a property-list section turns
 * its data fields into read-only rows but leaves a grid field a grid.
 */
class SectionLayoutEdgesSyncTest {

  public static class Line {
    public String concept = "night";
    public int qty = 2;
  }

  @UI("/section-edges/zones")
  @Compact
  @Zones({
    @Zone(name = "main"),
    @Zone(name = "unused", width = "10rem"),
    @Zone(name = "side", width = "18rem")
  })
  public static class ZonedPage {
    @Section(value = "Main", zone = "main")
    public String a = "a";

    @Section(value = "Side", zone = "side")
    public String b = "b";
  }

  @UI("/section-edges/property-list")
  public static class PropertyListPage {
    @Section(value = "Summary", propertyList = true)
    public String guest = "Ada";

    public List<Line> lines = new ArrayList<>(List.of(new Line()));
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(ZonedPage.class, PropertyListPage.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @Test
  void anEmptyZoneTakesNoColumnAndAZoneWithoutWidthFillsTheRest() {
    var increment = mateu.sync("/section-edges/zones");
    var grid = WireWalk.first(increment, ResponsiveGridDto.class);
    assertThat(grid).isNotNull();
    assertThat(grid.gridTemplateColumns()).isEqualTo("1fr 18rem");
  }

  @Test
  void aCompactPageDrawsTighterSectionTitles() {
    var titles =
        WireWalk.all(mateu.sync("/section-edges/zones"), TextDto.class).stream()
            .filter(t -> "Main".equals(t.text()) || "Side".equals(t.text()))
            .toList();
    assertThat(titles).isNotEmpty();
    assertThat(String.valueOf(mateu.sync("/section-edges/zones")))
        .contains("font-size: var(--lumo-font-size-l)");
  }

  @Test
  void aPropertyListMakesDataFieldsReadOnlyRowsButKeepsAGridAGrid() {
    var fields = WireWalk.all(mateu.sync("/section-edges/property-list"), FormFieldDto.class);
    var guest = fields.stream().filter(f -> "guest".equals(f.fieldId())).findFirst().orElseThrow();
    assertThat(guest.propertyRow()).isTrue();
    assertThat(guest.readOnly()).isTrue();
    var lines = fields.stream().filter(f -> "lines".equals(f.fieldId())).findFirst().orElseThrow();
    assertThat(lines.stereotype()).isEqualTo("grid");
    assertThat(lines.propertyRow()).isFalse();
  }
}
