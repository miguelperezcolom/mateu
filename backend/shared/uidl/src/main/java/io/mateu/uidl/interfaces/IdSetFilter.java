package io.mateu.uidl.interfaces;

import io.mateu.uidl.annotations.PrimaryKey;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.SearchRequest;
import java.lang.reflect.Field;
import java.lang.reflect.RecordComponent;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

/**
 * The framework's reserved id-set filter ({@code ?ids=A,B,C}), which works on every listing without
 * the app declaring it: a link — or an assistant that found some records with its tools — shows
 * exactly those rows in their listing.
 *
 * <p>It travels like any other filter: the renderer reads it off the URL into the listing's state
 * under {@link SearchRequest#IDS}, as a comma-joined string (or a list), and every search carries
 * it. {@link #parse} reads it back; {@link #narrow} is the fallback for a {@code search} that did
 * not honour {@link SearchRequest#ids()} itself: it keeps only the requested rows of the page it
 * returned (exact when they all fit in that page, which is what a short list of ids does unless the
 * listing ignores it AND has many pages).
 */
public final class IdSetFilter {

  /** The ids in a component state's reserved {@code ids} entry; empty when absent or blank. */
  public static List<String> from(Map<String, Object> componentState) {
    return componentState == null ? List.of() : parse(componentState.get(SearchRequest.IDS));
  }

  /** A comma-joined string or a list, trimmed, blanks and duplicates dropped, order kept. */
  public static List<String> parse(Object raw) {
    if (raw == null) {
      return List.of();
    }
    List<?> items =
        raw instanceof List<?> list
            ? list
            : raw instanceof Object[] array
                ? Arrays.asList(array)
                : Arrays.asList(raw.toString().split(","));
    Set<String> ids = new LinkedHashSet<>();
    for (Object item : items) {
      if (item == null) {
        continue;
      }
      var id = item.toString().trim();
      if (!id.isEmpty()) {
        ids.add(id);
      }
    }
    return List.copyOf(ids);
  }

  /**
   * Keeps, of the page a search returned, only the rows whose {@code idField} is one of {@code
   * ids}. A page that already holds only those rows (the listing honoured the filter) comes back
   * unchanged, the same instance. Rows whose id cannot be read are kept: dropping a row because we
   * could not tell what it is would be a wrong answer, keeping it only an imprecise one.
   */
  public static <Row> ListingData<Row> narrow(
      ListingData<Row> data, List<String> ids, String idField) {
    if (data == null || ids == null || ids.isEmpty() || data.page() == null) {
      return data;
    }
    var content = data.page().content();
    if (content == null || content.isEmpty()) {
      return data;
    }
    var wanted = Set.copyOf(ids);
    var kept = new ArrayList<Row>(content.size());
    for (Row row : content) {
      var id = idOf(row, idField);
      if (id == null || wanted.contains(id)) {
        kept.add(row);
      }
    }
    if (kept.size() == content.size()) {
      return data;
    }
    var page = data.page();
    return new ListingData<>(
        new Page<>(page.searchSignature(), page.pageSize(), 0, kept.size(), List.copyOf(kept)),
        data.emptyStateMessage(),
        data.aggregates(),
        data.groups());
  }

  /** {@link #narrow(ListingData, List, String)} with the row class's id field. */
  public static <Row> ListingData<Row> narrow(ListingData<Row> data, List<String> ids) {
    if (data == null || ids == null || ids.isEmpty() || data.page() == null) {
      return data;
    }
    var first =
        data.page().content() == null
            ? null
            : data.page().content().stream().filter(Objects::nonNull).findFirst().orElse(null);
    if (first == null || first instanceof Map<?, ?>) {
      return narrow(data, ids, "id");
    }
    return narrow(data, ids, idFieldOf(first.getClass()));
  }

  /** The field identifying a row: the {@code @PrimaryKey} one, else {@code id}, else the first. */
  public static String idFieldOf(Class<?> rowClass) {
    String first = null;
    boolean hasId = false;
    for (Class<?> type = rowClass;
        type != null && !Object.class.equals(type);
        type = type.getSuperclass()) {
      for (Field field : type.getDeclaredFields()) {
        if (java.lang.reflect.Modifier.isStatic(field.getModifiers())) {
          continue;
        }
        if (field.isAnnotationPresent(PrimaryKey.class)) {
          return field.getName();
        }
        hasId |= "id".equals(field.getName());
        if (first == null) {
          first = field.getName();
        }
      }
    }
    return hasId || first == null ? "id" : first;
  }

  static String idOf(Object row, String idField) {
    if (row == null || idField == null) {
      return null;
    }
    try {
      if (row instanceof Map<?, ?> map) {
        var value = map.get(idField);
        return value == null ? null : value.toString();
      }
      if (row.getClass().isRecord()) {
        for (RecordComponent component : row.getClass().getRecordComponents()) {
          if (component.getName().equals(idField)) {
            var accessor = component.getAccessor();
            accessor.setAccessible(true);
            var value = accessor.invoke(row);
            return value == null ? null : value.toString();
          }
        }
        return null;
      }
      for (Class<?> type = row.getClass();
          type != null && !Object.class.equals(type);
          type = type.getSuperclass()) {
        try {
          Field field = type.getDeclaredField(idField);
          field.setAccessible(true);
          var value = field.get(row);
          return value == null ? null : value.toString();
        } catch (NoSuchFieldException ignored) {
          // keep walking up
        }
      }
    } catch (ReflectiveOperationException | RuntimeException e) {
      return null;
    }
    return null;
  }

  private IdSetFilter() {}
}
