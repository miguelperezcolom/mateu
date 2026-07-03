package io.mateu.uidl.interfaces;

/**
 * Represents a selection control bound to a form field, reporting which item is currently selected.
 * Implement {@link #selected(HttpRequest)} to return the chosen {@link SelectedItem} (its id typed
 * as {@code IdType}), {@link #fieldId()} to identify the field, and {@link #withFieldId(String)} to
 * produce a copy bound to a given field id.
 *
 * @param <IdType> the type of the selected item's id
 */
public interface Selector<IdType> {

  SelectedItem<IdType> selected(HttpRequest httpRequest);

  String fieldId();

  Selector withFieldId(String name);
}
