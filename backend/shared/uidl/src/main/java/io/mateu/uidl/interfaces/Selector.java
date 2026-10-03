package io.mateu.uidl.interfaces;

import java.util.List;

/**
 * Represents a selection control bound to a form field, reporting which item is currently selected.
 * Implement {@link #selected(HttpRequest)} to return the chosen {@link SelectedItem} (its id typed
 * as {@code IdType}), {@link #fieldId()} to identify the field, and {@link #withFieldId(String)} to
 * produce a copy bound to a given field id.
 *
 * <p>The same selector serves a single-valued {@code @Searchable} field ({@code String hotelId})
 * and a multi-valued one ({@code List<String> hotelIds}, {@code Set<Long>}, {@code UUID[]}…). For a
 * multi-valued field the listing opens with row selection enabled and an «Add selected» button,
 * whose items come from {@link #selectedItems(HttpRequest)}; a row click still adds that one row,
 * through {@link #selected(HttpRequest)}.
 *
 * @param <IdType> the type of the selected item's id
 */
public interface Selector<IdType> {

  /** The item picked by clicking a row (typically from {@code httpRequest.getClickedRow(...)}). */
  SelectedItem<IdType> selected(HttpRequest httpRequest);

  /**
   * The items picked with the row checkboxes when the selector serves a MULTI-valued field and the
   * user presses «Add selected». The default maps each checked row through {@link
   * #selected(HttpRequest)}, presenting it as the clicked row — so a selector that reads {@code
   * httpRequest.getClickedRow(...)} serves multi-valued fields with no extra code. Override it when
   * the checked rows need another mapping (e.g. from {@code
   * httpRequest.getSelectedRows(rowClass)}).
   *
   * <p>With no checked rows it falls back to {@link #selected(HttpRequest)}, if it answers one.
   */
  default List<SelectedItem<IdType>> selectedItems(HttpRequest httpRequest) {
    return SearchableSelection.selectedItemsByRow(this, httpRequest);
  }

  String fieldId();

  Selector withFieldId(String name);
}
