package io.mateu.core.domain.out.componentmapper;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.uidl.Templates;
import io.mateu.uidl.annotations.KPI;
import io.mateu.uidl.annotations.Timestamp;
import org.junit.jupiter.api.Test;

/**
 * Values that come from DATA travel in texts the renderers evaluate as templates (a title from
 * {@code toString()}, a KPI value, a timestamp). They must arrive escaped, so a stored {@code ${…}}
 * is shown, never evaluated (review finding H2, server side).
 */
class DataIsNotATemplateTest {

  record Booking(String guest) {
    @Override
    public String toString() {
      return "Booking of " + guest;
    }
  }

  static class Dashboard {
    @KPI String revenue = "${fetch('//evil')}";

    @Timestamp("Updated")
    String updated = "${state.x}";
  }

  @Test
  void literalEscapesOnlyTextsThatCarryTheMarker() {
    assertThat(Templates.literal("plain \\ text")).isEqualTo("plain \\ text");
    assertThat(Templates.literal("a ${b} \\c")).isEqualTo("a \\${b} \\\\c");
    assertThat(Templates.literal(null)).isNull();
  }

  @Test
  void aTitleFromToStringIsEscaped() {
    var title = PageMetadataExtractor.getTitle(new Booking("${alert(1)}"));
    assertThat(title).isEqualTo("Booking of \\${alert(1)}");
  }

  @Test
  void kpiValuesAndTimestampsAreEscaped() {
    var kpis = PageMetadataExtractor.getKpis(new Dashboard());
    assertThat(kpis)
        .singleElement()
        .satisfies(k -> assertThat(k.text()).isEqualTo("\\${fetch('//evil')}"));
    assertThat(PageMetadataExtractor.getTimestamp(new Dashboard()))
        .isEqualTo("Updated \\${state.x}");
  }
}
