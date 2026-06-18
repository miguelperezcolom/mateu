package io.mateu.uidl.layout;

import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.GridColumn;
import java.util.Comparator;
import java.util.List;

/**
 * Selects the best column-display layout for a listing given its columns and the available viewport
 * width.
 *
 * <p>Decision rules (evaluated top to bottom):
 *
 * <ol>
 *   <li>r ≤ 1.0 → table (everything fits)
 *   <li>r > 1.6 or column count > 10 → master-detail
 *   <li>1.0 < r ≤ 1.6 AND a compact primary subset (priority ≤ 2 or identifier) fits in ≤ 8u →
 *       two-line list
 *   <li>has image/html stereotype OR 4–8 fields without a clear primary → cards
 *   <li>fallback → master-detail
 * </ol>
 *
 * where r = Σ(column weights) / available units (1u = 76px).
 */
public class ColumnLayoutSelector {

  public enum Layout {
    table,
    twoLineList,
    cards,
    masterDetail
  }

  public record Result(Layout layout, List<String> compactFieldIds) {}

  private final WeightEstimator estimator = new WeightEstimator();

  private double weightOf(GridColumn col) {
    return col.weight() != null ? col.weight() : estimator.base(col.dataType(), col.stereotype());
  }

  public Result select(List<GridColumn> columns, int availableWidthPx) {
    if (columns.isEmpty()) {
      return new Result(Layout.table, List.of());
    }

    double totalWeight = columns.stream().mapToDouble(this::weightOf).sum();
    double availableUnits = availableWidthPx / WeightEstimator.PX_PER_UNIT;
    double r = totalWeight / availableUnits;

    List<GridColumn> byPriority =
        columns.stream().sorted(Comparator.comparingInt(GridColumn::priority)).toList();

    List<GridColumn> compact =
        columns.stream()
            .filter(c -> c.identifier() || c.priority() <= 2)
            .sorted(Comparator.comparingInt(GridColumn::priority))
            .toList();

    if (r <= 1.0) {
      return new Result(Layout.table, byPriority.stream().map(GridColumn::id).toList());
    }

    if (r > 1.6 || columns.size() > 10) {
      return new Result(Layout.masterDetail, compact.stream().map(GridColumn::id).toList());
    }

    // Moderate density: prefer two-line list when a clear compact subset exists
    double compactWeight = compact.stream().mapToDouble(this::weightOf).sum();
    if (!compact.isEmpty() && compactWeight <= 8.0) {
      return new Result(Layout.twoLineList, compact.stream().map(GridColumn::id).toList());
    }

    boolean hasImageOrHtml =
        columns.stream()
            .anyMatch(
                c ->
                    FieldStereotype.image.equals(c.stereotype())
                        || FieldStereotype.html.equals(c.stereotype()));
    boolean noClearPrimary = compact.isEmpty();

    if (hasImageOrHtml || (noClearPrimary && columns.size() >= 4 && columns.size() <= 8)) {
      return new Result(Layout.cards, byPriority.stream().limit(6).map(GridColumn::id).toList());
    }

    return new Result(Layout.masterDetail, compact.stream().map(GridColumn::id).toList());
  }
}
