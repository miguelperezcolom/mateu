package io.mateu.springdata;

import io.mateu.uidl.data.AggregateFunction;
import io.mateu.uidl.data.GroupSummary;
import io.mateu.uidl.data.ListingSummaries;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

/**
 * The listing totals computed in memory over already-filtered rows — the fallback of {@link
 * JpaCrudStore#summaries} when the store has no EntityManager. Same output shape as the default
 * {@code CrudStore.summaries}: counts as long, the rest as double, groups ordered by their value
 * case-insensitively.
 */
final class InMemorySummaries {

  private InMemorySummaries() {}

  static ListingSummaries of(
      List<?> rows, Map<String, AggregateFunction> aggregates, String groupByField) {
    var totals = aggregate(rows, aggregates);
    List<GroupSummary> groups = List.of();
    if (groupByField != null) {
      var byGroup = new TreeMap<String, List<Object>>(String.CASE_INSENSITIVE_ORDER);
      for (Object row : rows) {
        byGroup
            .computeIfAbsent(String.valueOf(read(row, groupByField)), key -> new ArrayList<>())
            .add(row);
      }
      groups =
          byGroup.entrySet().stream()
              .map(
                  entry ->
                      new GroupSummary(
                          entry.getKey(),
                          entry.getValue().size(),
                          aggregate(entry.getValue(), aggregates)))
              .sorted(Comparator.comparing(GroupSummary::value, String.CASE_INSENSITIVE_ORDER))
              .toList();
    }
    return new ListingSummaries(totals, groups);
  }

  private static Map<String, Object> aggregate(
      List<?> rows, Map<String, AggregateFunction> aggregates) {
    if (aggregates == null || aggregates.isEmpty()) {
      return Map.of();
    }
    var result = new LinkedHashMap<String, Object>();
    aggregates.forEach(
        (field, function) -> {
          var values = rows.stream().map(row -> read(row, field)).filter(v -> v != null).toList();
          if (function == AggregateFunction.count) {
            result.put(field, (long) values.size());
            return;
          }
          var numbers =
              values.stream()
                  .filter(v -> v instanceof Number)
                  .mapToDouble(v -> ((Number) v).doubleValue())
                  .toArray();
          if (numbers.length == 0) {
            return;
          }
          var stats = java.util.Arrays.stream(numbers).summaryStatistics();
          switch (function) {
            case sum -> result.put(field, stats.getSum());
            case avg -> result.put(field, stats.getAverage());
            case min -> result.put(field, stats.getMin());
            case max -> result.put(field, stats.getMax());
            default -> {}
          }
        });
    return result;
  }

  /** Field path read ({@code a.b}), walking declared fields. */
  static Object read(Object target, String dotted) {
    Object current = target;
    for (String segment : dotted.split("\\.")) {
      if (current == null) {
        return null;
      }
      current = readField(current, segment);
    }
    return current;
  }

  private static Object readField(Object target, String name) {
    for (Class<?> c = target.getClass(); c != null && c != Object.class; c = c.getSuperclass()) {
      try {
        Field field = c.getDeclaredField(name);
        field.setAccessible(true);
        return field.get(target);
      } catch (NoSuchFieldException ignored) {
        // walk up
      } catch (IllegalAccessException e) {
        return null;
      }
    }
    return null;
  }
}
