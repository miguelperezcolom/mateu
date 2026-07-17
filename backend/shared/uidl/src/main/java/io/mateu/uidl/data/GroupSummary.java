package io.mateu.uidl.data;

import java.util.Map;

/**
 * One group of a {@code @GroupBy} listing: the group value (as text), how many rows it has in the
 * WHOLE filtered result set, the group's value for every {@code @Aggregate} column, and the ids of
 * the {@code @GroupAction} buttons this group must NOT show (null/empty = all visible; see {@code
 * GroupActionVisibility}).
 */
public record GroupSummary(
    String value,
    long count,
    Map<String, Object> aggregates,
    java.util.List<String> hiddenActions) {

  public GroupSummary(String value, long count, Map<String, Object> aggregates) {
    this(value, count, aggregates, null);
  }
}
