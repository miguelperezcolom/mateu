package io.mateu.test;

import static io.mateu.test.Json.list;
import static io.mateu.test.Json.map;
import static io.mateu.test.Json.str;

import io.mateu.uidl.annotations.Experimental;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * The listing on a {@link Screen}: its columns, the rows of the page on show, searching and opening
 * a row. The rows are those the last search answered — the first one runs when the screen opens, as
 * in a browser.
 */
@Experimental("test harness (3.0)")
public final class Listing {

  private final Screen screen;
  private final Screen.Frame frame;
  private final Map<String, Object> crudl;

  Listing(Screen screen, Screen.Frame frame, Map<String, Object> crudl) {
    this.screen = screen;
    this.frame = frame;
    this.crudl = crudl;
  }

  /**
   * The column ids, in order.
   *
   * @return the column ids
   */
  public List<String> columns() {
    return columnNodes().stream().map(c -> str(c.get("id"))).toList();
  }

  /**
   * The column headers, in order.
   *
   * @return the column labels
   */
  public List<String> columnLabels() {
    return columnNodes().stream().map(c -> str(c.get("label"))).toList();
  }

  private Map<String, Object> metadata() {
    return map(crudl.get("metadata"));
  }

  private String selectionKey() {
    var id = str(crudl.get("id"));
    return (id.isEmpty() ? "crud" : id) + "_selected_items";
  }

  private List<Map<String, Object>> columnNodes() {
    return Json.collect(metadata().get("columns"), n -> "GridColumn".equals(n.get("type")));
  }

  /**
   * The rows of the page on show, each as {@code column id → value}.
   *
   * @return the rows
   */
  public List<Row> rows() {
    var out = new ArrayList<Row>();
    int index = 0;
    for (Object row : list(page().get("content"))) {
      var values = map(row);
      if (values.containsKey("__mateuGroup")) {
        continue;
      }
      out.add(new Row(this, index++, values));
    }
    return out;
  }

  /**
   * How many rows match, over every page.
   *
   * @return the total, or the rows on show when the listing does not count
   */
  public long total() {
    var total = page().get("totalElements");
    return total instanceof Number n ? n.longValue() : rows().size();
  }

  /**
   * A row, by position on the page (0 = first).
   *
   * @param index the position
   * @return the row
   */
  public Row row(int index) {
    var rows = rows();
    if (index < 0 || index >= rows.size()) {
      throw new AssertionError("The listing shows " + rows.size() + " rows, no row " + index);
    }
    return rows.get(index);
  }

  /**
   * The first row showing this text in some cell.
   *
   * @param text the text of a cell
   * @return the row
   */
  public Row row(String text) {
    for (var row : rows()) {
      if (row.values().values().stream()
          .anyMatch(v -> v != null && String.valueOf(v).equals(text))) {
        return row;
      }
    }
    throw new AssertionError("No row shows \"" + text + "\". Rows: " + rows());
  }

  /**
   * Types into the search box and searches (from the first page).
   *
   * @param text what to search
   * @return the screen
   */
  public Screen search(String text) {
    frame.state.put("searchText", text == null ? "" : text);
    frame.state.put("page", 0);
    return runSearch();
  }

  /**
   * Sets a filter of the filter bar and searches.
   *
   * @param filterId the filter's id (the filters class field)
   * @param value its value
   * @return the screen
   */
  public Screen filter(String filterId, Object value) {
    frame.state.put(filterId, value instanceof Enum<?> e ? e.name() : value);
    frame.state.put("page", 0);
    return runSearch();
  }

  /**
   * Goes to a page of the results (0 = first).
   *
   * @param page the page
   * @return the screen
   */
  public Screen page(int page) {
    frame.state.put("page", page);
    return runSearch();
  }

  /**
   * Sorts by a column and searches.
   *
   * @param columnId the column
   * @param ascending ascending or descending
   * @return the screen
   */
  public Screen sortBy(String columnId, boolean ascending) {
    frame.state.put(
        "sort",
        List.of(Map.of("field", columnId, "direction", ascending ? "ascending" : "descending")));
    return runSearch();
  }

  private Screen runSearch() {
    frame.seedSearch();
    screen.startGesture();
    screen.dispatch(frame, "search", Map.of());
    return screen;
  }

  void select(Row row) {
    @SuppressWarnings("unchecked")
    var selected =
        new ArrayList<Object>(
            frame.state.get(selectionKey()) instanceof List<?> l ? (List<Object>) l : List.of());
    selected.add(new LinkedHashMap<>(row.values()));
    frame.state.put(selectionKey(), selected);
  }

  Screen open(Row row) {
    var rowRoute = str(metadata().get("rowRoute"));
    if (!rowRoute.isEmpty()) {
      var route = rowRoute;
      for (var entry : row.values().entrySet()) {
        route = route.replace("${row." + entry.getKey() + "}", String.valueOf(entry.getValue()));
      }
      return screen.navigate(route);
    }
    var open =
        columnNodes().stream()
            .map(c -> str(c.get("actionId")))
            .filter(a -> !a.isEmpty())
            .findFirst()
            .orElse("");
    if (open.isEmpty()) {
      throw new AssertionError(
          "The rows of this listing do not open (no rowRoute, no view column)");
    }
    screen.startGesture();
    var parameters = new LinkedHashMap<String, Object>(row.values());
    parameters.put("_clickedRow", new LinkedHashMap<>(row.values()));
    screen.dispatch(frame, open, parameters);
    return screen;
  }

  private Map<String, Object> page() {
    var own = map(map(frame.data.get(str(crudl.get("id")))).get("page"));
    if (own.containsKey("content")) {
      return own;
    }
    for (var value : frame.data.values()) {
      var page = map(map(value).get("page"));
      if (page.containsKey("content")) {
        return page;
      }
    }
    var page = map(frame.data.get("page"));
    if (page.containsKey("content")) {
      return page;
    }
    return Map.of();
  }

  @Override
  public String toString() {
    return "Listing" + columns() + " " + rows();
  }
}
