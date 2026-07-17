package io.mateu.uidl.interfaces;

import io.mateu.uidl.data.Direction;
import io.mateu.uidl.data.FilterCriterion;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.data.Sort;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * The persistence port an {@code AutoCrud} uses to load, save, list and delete its entities.
 * Implement it inline or as a bean and return it from {@code AutoCrud.repository()}. The core CRUD
 * operations are {@link #findById(String)}, {@link #save(Object)}, {@link #findAll()} and {@link
 * #deleteAllById(List)}; {@link #find(String, Identifiable, Pageable)} is the single
 * search+filter+sort+paginate entry point that fills the listing — it defaults to filtering {@code
 * findAll()} in memory, so override it to push the work to the database.
 *
 * @param <T> the entity type, which must be {@link Identifiable}
 */
public interface CrudRepository<T extends Identifiable> {
  Optional<T> findById(String id);

  String save(T entity);

  List<T> findAll();

  void deleteAllById(List<String> selectedIds);

  /**
   * Searches, filters and paginates entities.
   *
   * <p>The returned {@link Page} already carries {@code totalElements}, so implementers backed by a
   * database are expected to run both the count and the page query here (no separate count method
   * is needed on the port).
   *
   * <p>The default implementation loads {@link #findAll()} and filters/sorts/paginates in memory:
   * rows are matched against {@code searchText} using {@link Searchable#searchableText()} (or
   * {@code toString()} when the entity is not {@link Searchable}) — word by word: every
   * whitespace-separated word must be contained, case-insensitively and in any order — then against
   * each basic field of {@code filters} whose value differs from a freshly-constructed instance of
   * the filters class — the difference-from-default check is what tells a filter the user actually
   * set apart from field initializers and primitive zeros/falses (the filters object is hydrated
   * from the component state, so untouched fields keep their defaults; the flip side is that
   * filtering BY a default value needs an overridden {@code find}). String filters match by
   * case-insensitive containment, everything else by equality. Then rows are ordered according to
   * {@link Pageable#sort()} (reading each sort field reflectively via
   * getter/record-accessor/field). Override to push the work to the database.
   *
   * @param searchText free-text query; {@code null}/empty matches everything
   * @param filters an entity-shaped object carrying field-level filter values (may be {@code null})
   * @param pageable page number, size and sort; {@code null} returns a single page with all rows
   */
  default Page<T> find(String searchText, T filters, Pageable pageable) {
    return find(searchText, filters, List.of(), pageable);
  }

  /**
   * Like {@link #find(String, Identifiable, Pageable)} plus the {@code criteria} the example object
   * can't express: date/number ranges and value lists (see {@link FilterCriterion}). The framework
   * calls this overload only when such criteria exist, so implementations that override the 3-arg
   * {@code find} keep working unchanged for plain searches; override this one too to push
   * range/list filtering to the database (the default applies everything in memory over {@link
   * #findAll()}).
   */
  default Page<T> find(
      String searchText, T filters, List<FilterCriterion> criteria, Pageable pageable) {
    var all =
        findAll().stream()
            .filter(item -> matchesSearchText(item, searchText))
            .filter(matchesFilters(filters))
            .filter(item -> matchesCriteria(item, criteria))
            .collect(java.util.stream.Collectors.toCollection(ArrayList::new));
    var comparator = comparatorFor(pageable);
    if (comparator != null) {
      all.sort(comparator);
    }
    int pageSize = pageable != null && pageable.size() > 0 ? pageable.size() : all.size();
    int pageNumber = pageable != null ? pageable.page() : 0;
    int from = Math.min(pageNumber * pageSize, all.size());
    int to = Math.min(from + pageSize, all.size());
    return new Page<>("", pageSize, pageNumber, all.size(), all.subList(from, to));
  }

  /**
   * Aggregation companion of {@link #find}: computes the {@code @Aggregate} totals over the WHOLE
   * filtered result set (same search text, filters and criteria as the listing search — not just
   * the visible page) plus, when {@code groupByField} is set, one {@link
   * io.mateu.uidl.data.GroupSummary} per distinct value of that field (rows grouped after sorting
   * by it, so the group order matches the listing's). The default runs in memory over {@link
   * #findAll()} — same cost class as the default {@code find}; override it to run a single
   * aggregate query in the database instead.
   *
   * @param aggregates the columns to aggregate: field name → function
   * @param groupByField the {@code @GroupBy} field name, or null for totals only
   */
  default io.mateu.uidl.data.ListingSummaries summaries(
      String searchText,
      T filters,
      List<FilterCriterion> criteria,
      Map<String, io.mateu.uidl.data.AggregateFunction> aggregates,
      String groupByField) {
    var all =
        findAll().stream()
            .filter(item -> matchesSearchText(item, searchText))
            .filter(matchesFilters(filters))
            .filter(item -> matchesCriteria(item, criteria))
            .collect(java.util.stream.Collectors.toCollection(ArrayList::new));
    var totals = aggregateOver(all, aggregates);
    List<io.mateu.uidl.data.GroupSummary> groups = List.of();
    if (groupByField != null && !groupByField.isBlank()) {
      var byGroup = new java.util.LinkedHashMap<String, List<Object>>();
      all.stream()
          .sorted(
              Comparator.comparing(
                  item -> String.valueOf(readProperty(item, groupByField)),
                  String.CASE_INSENSITIVE_ORDER))
          .forEach(
              item ->
                  byGroup
                      .computeIfAbsent(
                          String.valueOf(readProperty(item, groupByField)),
                          key -> new ArrayList<>())
                      .add(item));
      groups =
          byGroup.entrySet().stream()
              .map(
                  entry ->
                      new io.mateu.uidl.data.GroupSummary(
                          entry.getKey(),
                          entry.getValue().size(),
                          aggregateOver(entry.getValue(), aggregates)))
              .toList();
    }
    return new io.mateu.uidl.data.ListingSummaries(totals, groups);
  }

  private static Map<String, Object> aggregateOver(
      List<? extends Object> rows, Map<String, io.mateu.uidl.data.AggregateFunction> aggregates) {
    if (aggregates == null || aggregates.isEmpty()) {
      return Map.of();
    }
    var result = new java.util.LinkedHashMap<String, Object>();
    aggregates.forEach(
        (field, function) -> {
          var values =
              rows.stream()
                  .map(row -> readProperty(row, field))
                  .filter(value -> value != null)
                  .toList();
          if (function == io.mateu.uidl.data.AggregateFunction.count) {
            result.put(field, (long) values.size());
            return;
          }
          var numbers =
              values.stream()
                  .filter(value -> value instanceof Number)
                  .map(value -> ((Number) value).doubleValue())
                  .toList();
          if (numbers.isEmpty()) {
            return;
          }
          switch (function) {
            case sum -> result.put(field, numbers.stream().mapToDouble(d -> d).sum());
            case avg -> result.put(field, numbers.stream().mapToDouble(d -> d).average().orElse(0));
            case min -> result.put(field, numbers.stream().mapToDouble(d -> d).min().orElse(0));
            case max -> result.put(field, numbers.stream().mapToDouble(d -> d).max().orElse(0));
            default -> {}
          }
        });
    return result;
  }

  /**
   * Word-based free-text match: the search text is split on whitespace and a row matches when its
   * searchable text ({@link Searchable#searchableText()} or {@code toString()}) contains EVERY
   * word, case-insensitively and in any order — "13 producto" finds "Producto 13", while requiring
   * the literal whole phrase would not.
   */
  private static boolean matchesSearchText(Object item, String searchText) {
    if (searchText == null || searchText.isBlank()) {
      return true;
    }
    var haystack =
        (item instanceof Searchable searchable ? searchable.searchableText() : item.toString())
            .toLowerCase();
    for (String word : searchText.trim().split("\\s+")) {
      if (!haystack.contains(word.toLowerCase())) {
        return false;
      }
    }
    return true;
  }

  /**
   * In-memory evaluation of the range/list criteria: numbers compare numerically whatever their
   * exact type, everything else through {@link Comparable} (with a toString fallback); {@code in}
   * accepts a match on equality or on the string form, so enum constants and their names both work.
   * A null row value never matches a criterion.
   */
  private static boolean matchesCriteria(Object item, List<FilterCriterion> criteria) {
    if (criteria == null || criteria.isEmpty()) {
      return true;
    }
    for (FilterCriterion criterion : criteria) {
      if (criterion == null || criterion.values() == null || criterion.values().isEmpty()) {
        continue;
      }
      Object rowValue = readProperty(item, criterion.field());
      if (rowValue == null) {
        return false;
      }
      switch (criterion.operator()) {
        case between -> {
          if (compareValues(rowValue, criterion.values().get(0)) < 0
              || (criterion.values().size() > 1
                  && compareValues(rowValue, criterion.values().get(1)) > 0)) {
            return false;
          }
        }
        case gte -> {
          if (compareValues(rowValue, criterion.values().get(0)) < 0) {
            return false;
          }
        }
        case lte -> {
          if (compareValues(rowValue, criterion.values().get(0)) > 0) {
            return false;
          }
        }
        case in -> {
          var matched = false;
          for (Object candidate : criterion.values()) {
            if (java.util.Objects.equals(rowValue, candidate)
                || (candidate != null && rowValue.toString().equals(candidate.toString()))) {
              matched = true;
              break;
            }
          }
          if (!matched) {
            return false;
          }
        }
      }
    }
    return true;
  }

  /**
   * Row predicate for the field-level filters: a filter field counts as SET only when its value
   * differs from a freshly-constructed filters instance (untouched fields keep their initializers /
   * primitive defaults, since the filters object is hydrated from the component state). Only basic
   * values (strings, numbers, booleans, chars, enums) are matched — strings by case-insensitive
   * containment, the rest by equality. If the filters class has no reachable no-arg constructor the
   * baseline is null-only, so primitive defaults would count as set — acceptable for the in-memory
   * default; override find() for anything smarter.
   */
  private java.util.function.Predicate<T> matchesFilters(T filters) {
    if (filters == null) {
      return item -> true;
    }
    Object defaults = defaultsInstance(filters.getClass());
    List<java.lang.reflect.Field> active = new ArrayList<>();
    List<Object> values = new ArrayList<>();
    for (Class<?> c = filters.getClass(); c != null && c != Object.class; c = c.getSuperclass()) {
      for (var field : c.getDeclaredFields()) {
        if (field.isSynthetic() || java.lang.reflect.Modifier.isStatic(field.getModifiers())) {
          continue;
        }
        try {
          field.setAccessible(true);
          Object value = field.get(filters);
          if (value == null || !isBasicFilterValue(value)) {
            continue;
          }
          if (value instanceof String s && s.isBlank()) {
            continue;
          }
          if (defaults != null && java.util.Objects.equals(value, field.get(defaults))) {
            continue;
          }
          active.add(field);
          values.add(value);
        } catch (ReflectiveOperationException ignored) {
          // unreadable field: not filterable
        }
      }
    }
    if (active.isEmpty()) {
      return item -> true;
    }
    return item -> {
      for (int i = 0; i < active.size(); i++) {
        Object rowValue = readProperty(item, active.get(i).getName());
        Object filterValue = values.get(i);
        if (filterValue instanceof String s) {
          if (rowValue == null || !rowValue.toString().toLowerCase().contains(s.toLowerCase())) {
            return false;
          }
        } else if (!java.util.Objects.equals(rowValue, filterValue)) {
          return false;
        }
      }
      return true;
    };
  }

  /**
   * Baseline instance for the difference-from-default check: the no-arg constructor when there is
   * one, or — for records, which have none — the canonical constructor fed with null/zero/false, so
   * primitive components left untouched by the state hydration don't count as user-set filters.
   * Returns {@code null} when neither works (then only null means "unset").
   */
  private static Object defaultsInstance(Class<?> type) {
    try {
      if (type.isRecord()) {
        var components = type.getRecordComponents();
        var argTypes = new Class<?>[components.length];
        var args = new Object[components.length];
        for (int i = 0; i < components.length; i++) {
          argTypes[i] = components[i].getType();
          args[i] = primitiveDefault(argTypes[i]);
        }
        var canonical = type.getDeclaredConstructor(argTypes);
        canonical.setAccessible(true);
        return canonical.newInstance(args);
      }
      var constructor = type.getDeclaredConstructor();
      constructor.setAccessible(true);
      return constructor.newInstance();
    } catch (ReflectiveOperationException | RuntimeException ignored) {
      return null;
    }
  }

  private static Object primitiveDefault(Class<?> type) {
    if (!type.isPrimitive()) {
      return null;
    }
    if (type == boolean.class) return false;
    if (type == char.class) return '\0';
    if (type == byte.class) return (byte) 0;
    if (type == short.class) return (short) 0;
    if (type == int.class) return 0;
    if (type == long.class) return 0L;
    if (type == float.class) return 0f;
    return 0d;
  }

  private static boolean isBasicFilterValue(Object value) {
    return value instanceof String
        || value instanceof Number
        || value instanceof Boolean
        || value instanceof Character
        || value.getClass().isEnum();
  }

  /** Builds a {@link Comparator} honouring {@link Pageable#sort()}, or {@code null} if no sort. */
  private static Comparator<Object> comparatorFor(Pageable pageable) {
    if (pageable == null || pageable.sort() == null) {
      return null;
    }
    Comparator<Object> comparator = null;
    for (Sort sort : pageable.sort()) {
      if (sort == null || sort.field() == null || sort.field().isBlank()) {
        continue;
      }
      String field = sort.field();
      Comparator<Object> next =
          (a, b) -> compareValues(readProperty(a, field), readProperty(b, field));
      if (sort.direction() == Direction.descending) {
        next = next.reversed();
      }
      comparator = (comparator == null) ? next : comparator.thenComparing(next);
    }
    return comparator;
  }

  /**
   * Natural-order comparison of two property values; {@code null}s sort last, numbers numerically
   * whatever their exact type (an Integer row value must compare correctly against a Double coming
   * from the wire), non-Comparables by {@code toString()}.
   */
  @SuppressWarnings({"unchecked", "rawtypes"})
  private static int compareValues(Object a, Object b) {
    if (a == null && b == null) {
      return 0;
    }
    if (a == null) {
      return 1;
    }
    if (b == null) {
      return -1;
    }
    if (a instanceof Number numberA && b instanceof Number numberB) {
      return Double.compare(numberA.doubleValue(), numberB.doubleValue());
    }
    if (a instanceof Comparable && a.getClass().isInstance(b)) {
      return ((Comparable) a).compareTo(b);
    }
    return a.toString().compareTo(b.toString());
  }

  /**
   * Reads a property by name: record accessor / {@code getX} / {@code isX}, then declared field.
   */
  private static Object readProperty(Object target, String name) {
    if (target == null) {
      return null;
    }
    Class<?> type = target.getClass();
    String capitalized = Character.toUpperCase(name.charAt(0)) + name.substring(1);
    for (String methodName : new String[] {name, "get" + capitalized, "is" + capitalized}) {
      try {
        var method = type.getMethod(methodName);
        method.setAccessible(true);
        return method.invoke(target);
      } catch (ReflectiveOperationException ignored) {
        // try the next accessor shape
      }
    }
    for (Class<?> c = type; c != null && c != Object.class; c = c.getSuperclass()) {
      try {
        var declaredField = c.getDeclaredField(name);
        declaredField.setAccessible(true);
        return declaredField.get(target);
      } catch (ReflectiveOperationException ignored) {
        // walk up the hierarchy
      }
    }
    return null;
  }
}
