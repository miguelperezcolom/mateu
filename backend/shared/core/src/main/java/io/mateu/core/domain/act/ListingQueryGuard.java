package io.mateu.core.domain.act;

import io.mateu.core.domain.FieldAccess;
import io.mateu.uidl.interfaces.Filterable;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Listing;
import io.mateu.uidl.interfaces.ReactiveListing;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * What a client may ask a listing search (or export) for, applied before the search runs — once,
 * for a crud, a capability listing and a plain {@link Listing} alike:
 *
 * <ul>
 *   <li>a page number below zero is the first page, a page size of 0 or less (which a store's
 *       default {@code find} read as "every row") or above {@value #DEFAULT_MAX_SIZE} (setting
 *       {@value #MAX_SIZE_PROPERTY}) is that maximum — the client chose both unbounded, so a
 *       database store got {@code size=10000000} as it came (GA review);
 *   <li>a sort or a filter on a field the caller may not read ({@code @EyesOnly}) is dropped: the
 *       order or the matching rows of a hidden column tell its values as well as the column would.
 * </ul>
 */
public final class ListingQueryGuard {

  /** The setting capping the rows one page of a listing may ask for. */
  public static final String MAX_SIZE_PROPERTY = "mateu.listing.max-page-size";

  static final int DEFAULT_MAX_SIZE = 500;

  private ListingQueryGuard() {}

  /** Whether {@code instance} is a listing whose search inputs this guard narrows. */
  static boolean applies(Object instance) {
    return instance instanceof Listing<?> || instance instanceof ReactiveListing<?>;
  }

  /**
   * {@code httpRequest} with its component state narrowed to what the caller may ask {@code
   * instance} for — the request to hand the search.
   */
  public static HttpRequest apply(Object instance, HttpRequest httpRequest) {
    if (!applies(instance) || httpRequest == null || httpRequest.runActionRq() == null) {
      return httpRequest;
    }
    var rq = httpRequest.runActionRq();
    var state = rq.componentState();
    if (state == null) {
      return httpRequest;
    }
    var narrowed = narrow(state, rowClassOf(instance), filtersClassOf(instance), httpRequest);
    return narrowed == state
        ? httpRequest
        : io.mateu.core.domain.RequestOverride.withRunActionRq(
            httpRequest, io.mateu.core.domain.RequestOverride.copy(rq, narrowed, null));
  }

  static Map<String, Object> narrow(
      Map<String, Object> state, Class<?> rowClass, Class<?> filtersClass, HttpRequest rq) {
    var out = new LinkedHashMap<>(state);
    var changed = false;
    var page = toInt(out.get("page"));
    if (page != null && page < 0) {
      out.put("page", 0);
      changed = true;
    }
    var size = toInt(out.get("size"));
    if (size != null && (size <= 0 || size > maxSize())) {
      // 0 or less meant "every row" to a store's default find: a client could ask for them all
      out.put("size", maxSize());
      changed = true;
    }
    var hiddenInRows = rowClass != null ? FieldAccess.unreadable(rowClass, rq) : List.<String>of();
    if (!hiddenInRows.isEmpty() && out.get("sort") instanceof List<?> sorts) {
      var kept =
          sorts.stream()
              .filter(
                  sort ->
                      !(sort instanceof Map<?, ?> map)
                          || !hiddenInRows.contains(
                              String.valueOf(
                                  map.get("fieldId") != null
                                      ? map.get("fieldId")
                                      : map.get("field"))))
              .toList();
      if (kept.size() != sorts.size()) {
        out.put("sort", kept);
        changed = true;
      }
    }
    var hidden = new java.util.LinkedHashSet<String>(hiddenInRows);
    if (filtersClass != null && filtersClass != rowClass) {
      hidden.addAll(FieldAccess.unreadable(filtersClass, rq));
    }
    for (var name : hidden) {
      for (var key : List.of(name, name + "_from", name + "_to")) {
        if (out.containsKey(key)) {
          out.remove(key);
          changed = true;
        }
      }
    }
    return changed ? out : state;
  }

  static int maxSize() {
    try {
      var configured = io.mateu.core.infra.MateuSettings.get(MAX_SIZE_PROPERTY);
      if (configured != null && !configured.isBlank()) {
        var value = Integer.parseInt(configured.trim());
        if (value > 0) {
          return value;
        }
      }
    } catch (RuntimeException e) {
      // an unreadable setting keeps the default
    }
    return DEFAULT_MAX_SIZE;
  }

  private static Integer toInt(Object value) {
    if (value instanceof Number number) {
      return number.intValue();
    }
    if (value instanceof String text && !text.isBlank()) {
      try {
        return Integer.parseInt(text.trim());
      } catch (NumberFormatException e) {
        return null;
      }
    }
    return null;
  }

  private static Class<?> rowClassOf(Object instance) {
    try {
      if (instance instanceof Listing<?> listing) {
        return listing.rowClass();
      }
      if (instance instanceof ReactiveListing<?> listing) {
        return listing.rowClass();
      }
    } catch (RuntimeException e) {
      // a listing whose row type cannot be read: nothing to narrow by
    }
    return null;
  }

  private static Class<?> filtersClassOf(Object instance) {
    try {
      return instance instanceof Filterable<?> filterable ? filterable.filtersClass() : null;
    } catch (RuntimeException e) {
      return null;
    }
  }
}
