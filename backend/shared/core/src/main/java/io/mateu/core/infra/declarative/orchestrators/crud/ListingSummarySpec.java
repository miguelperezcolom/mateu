package io.mateu.core.infra.declarative.orchestrators.crud;

import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.annotations.Aggregate;
import io.mateu.uidl.annotations.GroupBy;
import io.mateu.uidl.data.AggregateFunction;
import io.mateu.uidl.data.Direction;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.data.Sort;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * What a row class asks to be summarized: the {@code @Aggregate} columns (field → function) and the
 * {@code @GroupBy} column, read reflectively once per request. When a group column exists it is
 * prepended to the search sort so rows of the same group stay contiguous in the listing (the user's
 * own sort still applies within each group).
 */
public record ListingSummarySpec(Map<String, AggregateFunction> aggregates, String groupBy) {

  public static ListingSummarySpec of(Class<?> rowClass) {
    var aggregates = new LinkedHashMap<String, AggregateFunction>();
    String groupBy = null;
    for (Field field : allFields(rowClass)) {
      var aggregate = MetaAnnotations.find(field, Aggregate.class);
      if (aggregate != null) {
        aggregates.put(field.getName(), aggregate.value());
      }
      if (groupBy == null && MetaAnnotations.isPresent(field, GroupBy.class)) {
        groupBy = field.getName();
      }
    }
    return new ListingSummarySpec(aggregates, groupBy);
  }

  private static List<Field> allFields(Class<?> type) {
    var fields = new ArrayList<Field>();
    for (Class<?> current = type;
        current != null && current != Object.class;
        current = current.getSuperclass()) {
      fields.addAll(List.of(current.getDeclaredFields()));
    }
    return fields;
  }

  public boolean isEmpty() {
    return aggregates.isEmpty() && groupBy == null;
  }

  /** Prepends the group column to the sort (unless the user already sorts by it first). */
  public Pageable prependGroupSort(Pageable pageable) {
    if (groupBy == null || pageable == null) {
      return pageable;
    }
    var sorts = pageable.sort() != null ? pageable.sort() : List.<Sort>of();
    if (!sorts.isEmpty() && groupBy.equals(sorts.get(0).field())) {
      return pageable;
    }
    var prepended = new ArrayList<Sort>();
    prepended.add(new Sort(groupBy, Direction.ascending));
    sorts.stream().filter(sort -> !groupBy.equals(sort.field())).forEach(prepended::add);
    return new Pageable(pageable.page(), pageable.size(), prepended);
  }
}
