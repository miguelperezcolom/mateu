package io.mateu.uidl.data;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import lombok.Builder;
import lombok.With;

/**
 * One page of listing rows plus, when the row class declares {@code @Aggregate}/{@code @GroupBy}
 * columns, the aggregation companion: {@code aggregates} carries the totals of every aggregated
 * column over the WHOLE filtered result set (the listing's totals footer) and {@code groups} one
 * {@link GroupSummary} per group (the grid's group subtotal rows).
 */
@Builder
@With
public record ListingData<Row>(
    Page<Row> page,
    String emptyStateMessage,
    Map<String, Object> aggregates,
    List<GroupSummary> groups) {

  public ListingData(Page<Row> page) {
    this(page, null, null, null);
  }

  public ListingData(Page<Row> page, String emptyStateMessage) {
    this(page, emptyStateMessage, null, null);
  }

  public static <Row> ListingData<Row> from(List<Row> rows) {
    return new ListingData<>(new Page("", rows.size(), 0, rows.size(), rows));
  }

  public static <Row> ListingData<Row> of(Row... rows) {
    return new ListingData<>(
        new Page("", rows.length, 0, rows.length, Arrays.stream(rows).toList()));
  }

  public static <Row> ListingData<Row> of(List<Row> rows) {
    return new ListingData<>(new Page("", rows.size(), 0, rows.size(), rows));
  }
}
