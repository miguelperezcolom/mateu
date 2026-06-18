package io.mateu.uidl.layout;

import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.fluent.FiltersLayout;
import java.util.List;

/**
 * Selects the best filter-panel layout for a listing given its filter fields.
 *
 * <p>Decision rules:
 *
 * <ol>
 *   <li>0 filters → inline (search bar only)
 *   <li>Σ(filter weights) ≤ 4u → inline (controls sit beside the search bar)
 *   <li>≥ 6 filters OR Σ > 8u → drawer (side panel for heavy filter sets)
 *   <li>otherwise → popover (button + badge + dropdown panel)
 * </ol>
 *
 * <p>Context modifiers applied on top of {@link WeightEstimator#base}:
 *
 * <ul>
 *   <li>dateRange filter → ×1.5 (shows two date pickers)
 *   <li>listBox stereotype → ×1.5 (multi-select list needs more vertical space)
 * </ul>
 *
 * <p>Active filter chips are always rendered inline in the search bar regardless of where their
 * controls live — this is a renderer concern, not reflected in the layout enum.
 */
public class FilterLayoutSelector {

  private static final double INLINE_THRESHOLD = 4.0;
  private static final double DRAWER_WEIGHT_THRESHOLD = 8.0;
  private static final int DRAWER_COUNT_THRESHOLD = 6;

  private final WeightEstimator estimator = new WeightEstimator();

  double filterWeight(FormField filter) {
    double base = estimator.base(filter.dataType(), filter.stereotype());
    if (FieldDataType.dateRange.equals(filter.dataType())) return base * 1.5;
    if (FieldStereotype.listBox.equals(filter.stereotype())) return base * 1.5;
    return base;
  }

  public FiltersLayout selectLayout(
      boolean searchable, List<FormField> filters, int availableWidthPx) {
    if (filters.isEmpty()) {
      return FiltersLayout.inline;
    }

    double totalWeight = filters.stream().mapToDouble(this::filterWeight).sum();

    if (totalWeight <= INLINE_THRESHOLD) {
      return FiltersLayout.inline;
    }

    if (filters.size() >= DRAWER_COUNT_THRESHOLD || totalWeight > DRAWER_WEIGHT_THRESHOLD) {
      return FiltersLayout.drawer;
    }

    return FiltersLayout.popover;
  }
}
