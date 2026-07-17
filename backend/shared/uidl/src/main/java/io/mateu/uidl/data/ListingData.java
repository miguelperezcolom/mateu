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

  /**
   * When the row class declares a {@code @GroupBy} column and this page carries no group summaries
   * yet (custom listings rarely compute them), synthesize one per group from the page rows — value
   * and count, no aggregates — so the grid can render its group subtotal rows. AutoCrud listings
   * compute exact whole-filtered-set summaries via {@code CrudRepository#summaries} instead; a
   * listing that already set {@code groups} is left untouched.
   */
  public ListingData<Row> withSynthesizedGroups(Class<?> rowClass) {
    if ((groups != null && !groups.isEmpty())
        || rowClass == null
        || page == null
        || page.content() == null
        || page.content().isEmpty()) {
      return this;
    }
    java.lang.reflect.Field groupField = null;
    for (Class<?> type = rowClass;
        type != null && type != Object.class && groupField == null;
        type = type.getSuperclass()) {
      for (var field : type.getDeclaredFields()) {
        if (field.isAnnotationPresent(io.mateu.uidl.annotations.GroupBy.class)) {
          groupField = field;
          break;
        }
      }
    }
    if (groupField == null) {
      return this;
    }
    groupField.setAccessible(true);
    var counts = new java.util.LinkedHashMap<String, Long>();
    for (Row row : page.content()) {
      try {
        counts.merge(String.valueOf(groupField.get(row)), 1L, Long::sum);
      } catch (IllegalAccessException e) {
        return this;
      }
    }
    return withGroups(
        counts.entrySet().stream()
            .map(entry -> new GroupSummary(entry.getKey(), entry.getValue(), Map.of()))
            .toList());
  }
}
