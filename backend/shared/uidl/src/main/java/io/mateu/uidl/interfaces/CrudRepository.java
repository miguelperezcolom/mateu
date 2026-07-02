package io.mateu.uidl.interfaces;

import io.mateu.uidl.data.Direction;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.data.Sort;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

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
   * {@code toString()} when the entity is not {@link Searchable}), then ordered according to {@link
   * Pageable#sort()} (reading each sort field reflectively via getter/record-accessor/field). The
   * {@code filters} argument is ignored by this default — override to apply field-level filtering
   * (typically DB-side).
   *
   * @param searchText free-text query; {@code null}/empty matches everything
   * @param filters an entity-shaped object carrying field-level filter values (may be {@code null})
   * @param pageable page number, size and sort; {@code null} returns a single page with all rows
   */
  default Page<T> find(String searchText, T filters, Pageable pageable) {
    var all =
        findAll().stream()
            .filter(
                item ->
                    searchText == null
                        || searchText.isEmpty()
                        || (item instanceof Searchable searchable
                                ? searchable.searchableText()
                                : item.toString())
                            .toLowerCase()
                            .contains(searchText.toLowerCase()))
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
   * Natural-order comparison of two property values; {@code null}s sort last, non-Comparables by
   * {@code toString()}.
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
