package io.mateu.uidl.layout;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.fluent.FiltersLayout;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * Verifies filter-panel layout selection based on total filter weight.
 *
 * <p>Case A — light filters (fits inline):
 *
 * <pre>
 *   active    bool              1.0u
 *   category  string+combobox   2.0u  (enum-like select)
 *                       Σ =    3.0u  ≤ 4u → inline
 * </pre>
 *
 * <p>Case B — heavy filters (drawer):
 *
 * <pre>
 *   dateRange  dateRange         2.5u × 1.5 = 3.75u  (2 date pickers)
 *   categories string+listBox    3.0u × 1.5 = 4.50u  (multi-select)
 *   tags       string+listBox    3.0u × 1.5 = 4.50u  (multi-select)
 *                                          Σ = 12.75u → drawer
 * </pre>
 */
class FilterLayoutSelectorTest {

  private FilterLayoutSelector selector;

  @BeforeEach
  void setUp() {
    selector = new FilterLayoutSelector();
  }

  // ── Case A ──────────────────────────────────────────────────────────────────

  @Test
  void fewLightFiltersAreInline() {
    List<FormField> filters =
        List.of(
            FormField.builder().id("active").dataType(FieldDataType.bool).build(),
            FormField.builder()
                .id("category")
                .dataType(FieldDataType.string)
                .stereotype(FieldStereotype.combobox)
                .build());

    FiltersLayout layout = selector.selectLayout(true, filters, 1200);

    assertThat(layout).isEqualTo(FiltersLayout.inline);
  }

  @Test
  void totalWeightOfLightFiltersIsBelowThreshold() {
    FormField active = FormField.builder().id("active").dataType(FieldDataType.bool).build();
    FormField category =
        FormField.builder()
            .id("category")
            .dataType(FieldDataType.string)
            .stereotype(FieldStereotype.combobox)
            .build();

    double total = selector.filterWeight(active) + selector.filterWeight(category);

    assertThat(total).isLessThanOrEqualTo(4.0);
  }

  // ── Case B ──────────────────────────────────────────────────────────────────

  @Test
  void heavyFiltersGoToDrawer() {
    List<FormField> filters =
        List.of(
            FormField.builder().id("period").dataType(FieldDataType.dateRange).build(),
            FormField.builder()
                .id("categories")
                .dataType(FieldDataType.string)
                .stereotype(FieldStereotype.listBox)
                .build(),
            FormField.builder()
                .id("tags")
                .dataType(FieldDataType.string)
                .stereotype(FieldStereotype.listBox)
                .build());

    FiltersLayout layout = selector.selectLayout(true, filters, 1200);

    assertThat(layout).isEqualTo(FiltersLayout.drawer);
  }

  @Test
  void heavyFiltersWeightExceedsDrawerThreshold() {
    FormField dateRange =
        FormField.builder().id("period").dataType(FieldDataType.dateRange).build();
    FormField cat =
        FormField.builder()
            .id("categories")
            .dataType(FieldDataType.string)
            .stereotype(FieldStereotype.listBox)
            .build();
    FormField tags =
        FormField.builder()
            .id("tags")
            .dataType(FieldDataType.string)
            .stereotype(FieldStereotype.listBox)
            .build();

    double total =
        selector.filterWeight(dateRange) + selector.filterWeight(cat) + selector.filterWeight(tags);

    assertThat(total).isGreaterThan(8.0);
  }

  // ── Edge cases ───────────────────────────────────────────────────────────────

  @Test
  void noFiltersIsInline() {
    FiltersLayout layout = selector.selectLayout(true, List.of(), 1200);
    assertThat(layout).isEqualTo(FiltersLayout.inline);
  }

  @Test
  void sixOrMoreFiltersGoToDrawerRegardlessOfWeight() {
    FormField bool = FormField.builder().id("f").dataType(FieldDataType.bool).build();
    List<FormField> filters = List.of(bool, bool, bool, bool, bool, bool); // 6 × 1u = 6u

    FiltersLayout layout = selector.selectLayout(false, filters, 1200);

    assertThat(layout).isEqualTo(FiltersLayout.drawer);
  }

  @Test
  void mediumWeightFiltersGoToPopover() {
    // 3 date filters: 3 × 2u = 6u > 4u but ≤ 8u → popover
    List<FormField> filters =
        List.of(
            FormField.builder().id("from").dataType(FieldDataType.date).build(),
            FormField.builder().id("to").dataType(FieldDataType.date).build(),
            FormField.builder().id("due").dataType(FieldDataType.date).build());

    FiltersLayout layout = selector.selectLayout(true, filters, 1200);

    assertThat(layout).isEqualTo(FiltersLayout.popover);
  }
}
