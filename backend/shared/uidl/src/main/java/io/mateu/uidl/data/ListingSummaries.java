package io.mateu.uidl.data;

import java.util.List;
import java.util.Map;

/**
 * The aggregation companion of a listing search: the totals of every {@code @Aggregate} column over
 * the WHOLE filtered result set, plus one {@link GroupSummary} per {@code @GroupBy} group. Produced
 * by {@code CrudRepository.summaries} (in memory by default; override it to run one aggregate query
 * in the database instead).
 */
public record ListingSummaries(Map<String, Object> totals, List<GroupSummary> groups) {

  public static ListingSummaries empty() {
    return new ListingSummaries(Map.of(), List.of());
  }
}
