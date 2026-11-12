package io.mateu.test;

import io.mateu.uidl.annotations.Experimental;
import java.util.Collections;
import java.util.Map;

/** A row of a {@link Listing}. */
@Experimental("test harness (3.0)")
public final class Row {

  private final Listing listing;
  private final int index;
  private final Map<String, Object> values;

  Row(Listing listing, int index, Map<String, Object> values) {
    this.listing = listing;
    this.index = index;
    this.values = values;
  }

  /**
   * Its position on the page (0 = first).
   *
   * @return the position
   */
  public int index() {
    return index;
  }

  /**
   * Its values by column id (the row as the server sent it, so the id is there too).
   *
   * @return the values
   */
  public Map<String, Object> values() {
    return Collections.unmodifiableMap(values);
  }

  /**
   * One cell's value.
   *
   * @param columnId the column id
   * @return the value, as JSON
   */
  public Object get(String columnId) {
    return values.get(columnId);
  }

  /**
   * Clicks it: opens the record (its {@code rowRoute}, or the listing's {@code view}).
   *
   * @return the screen, showing the record
   */
  public Screen open() {
    return listing.open(this);
  }

  /**
   * Ticks its selection box (for Delete and the bulk actions); the selection travels with the next
   * action.
   *
   * @return this row
   */
  public Row select() {
    listing.select(this);
    return this;
  }

  @Override
  public String toString() {
    return values.toString();
  }
}
