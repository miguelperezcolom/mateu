package io.mateu.uidl.data;

import java.util.Map;

/**
 * One group of a {@code @GroupBy} listing: the group value (as text), how many rows it has in the
 * WHOLE filtered result set, and the group's value for every {@code @Aggregate} column.
 */
public record GroupSummary(String value, long count, Map<String, Object> aggregates) {}
