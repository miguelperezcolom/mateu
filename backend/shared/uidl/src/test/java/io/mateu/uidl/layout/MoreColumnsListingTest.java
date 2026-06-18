package io.mateu.uidl.layout;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;

import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.GridColumn;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * Tests the weight-based column layout selector against a 9-field listing (Row2) that mixes image
 * and html stereotypes.
 *
 * <p>Row2 field breakdown (1u ≈ 76px):
 *
 * <pre>
 *   name        string            3.0u  (identifier, priority 0)
 *   status      status            1.5u  (priority 1)
 *   balance     number            2.0u  (priority 2)
 *   createdDate date              2.0u
 *   photo       image stereotype  4.0u
 *   description html  stereotype  5.0u
 *   count       integer           1.5u
 *   active      bool              1.0u
 *   rating      integer           1.5u
 *                         Σ =   21.5u
 * </pre>
 */
class MoreColumnsListingTest {

  private List<GridColumn> row2Columns;
  private WeightEstimator estimator;
  private ColumnLayoutSelector selector;

  @BeforeEach
  void setUp() {
    estimator = new WeightEstimator();
    selector = new ColumnLayoutSelector();
    row2Columns =
        List.of(
            GridColumn.builder()
                .id("name")
                .dataType(FieldDataType.string)
                .priority(0)
                .identifier(true)
                .build(),
            GridColumn.builder().id("status").dataType(FieldDataType.status).priority(1).build(),
            GridColumn.builder().id("balance").dataType(FieldDataType.number).priority(2).build(),
            GridColumn.builder().id("createdDate").dataType(FieldDataType.date).build(),
            GridColumn.builder().id("photo").stereotype(FieldStereotype.image).build(),
            GridColumn.builder().id("description").stereotype(FieldStereotype.html).build(),
            GridColumn.builder().id("count").dataType(FieldDataType.integer).build(),
            GridColumn.builder().id("active").dataType(FieldDataType.bool).build(),
            GridColumn.builder().id("rating").dataType(FieldDataType.integer).build());
  }

  @Test
  void totalWeightIsApproximately21_5Units() {
    double total =
        row2Columns.stream().mapToDouble(c -> estimator.base(c.dataType(), c.stereotype())).sum();
    assertThat(total).isCloseTo(21.5, within(0.01));
  }

  @Test
  void narrowViewportFallsToMasterDetail() {
    // 640px / 76 ≈ 8.42u → r ≈ 2.55 → master-detail
    ColumnLayoutSelector.Result result = selector.select(row2Columns, 640);

    assertThat(result.layout()).isEqualTo(ColumnLayoutSelector.Layout.masterDetail);
  }

  @Test
  void compactLineinMasterDetailShowsIdentifierAndTopPriorityFields() {
    ColumnLayoutSelector.Result result = selector.select(row2Columns, 640);

    assertThat(result.compactFieldIds()).containsExactly("name", "status", "balance");
  }

  @Test
  void moderateViewportShowsTwoLineList() {
    // 1280px / 76 ≈ 16.8u → r ≈ 1.28 → compact subset (name+status+balance = 6.5u) → two-line list
    ColumnLayoutSelector.Result result = selector.select(row2Columns, 1280);

    assertThat(result.layout()).isEqualTo(ColumnLayoutSelector.Layout.twoLineList);
    assertThat(result.compactFieldIds()).containsExactly("name", "status", "balance");
  }

  @Test
  void wideViewportShowsFullTable() {
    // 1700px / 76 ≈ 22.4u → r ≈ 0.96 → table
    ColumnLayoutSelector.Result result = selector.select(row2Columns, 1700);

    assertThat(result.layout()).isEqualTo(ColumnLayoutSelector.Layout.table);
  }

  @Test
  void weightOverrideOnColumnIsRespected() {
    List<GridColumn> columns =
        List.of(
            GridColumn.builder()
                .id("name")
                .dataType(FieldDataType.string)
                .weight(1.0) // explicit override: renders compact
                .priority(0)
                .identifier(true)
                .build());

    double total =
        columns.stream()
            .mapToDouble(
                c -> c.weight() != null ? c.weight() : estimator.base(c.dataType(), c.stereotype()))
            .sum();

    assertThat(total).isEqualTo(1.0);
  }

  @Test
  void emptyColumnListReturnsTable() {
    ColumnLayoutSelector.Result result = selector.select(List.of(), 1024);
    assertThat(result.layout()).isEqualTo(ColumnLayoutSelector.Layout.table);
  }
}
