package io.mateu.uidl.data;

import io.mateu.uidl.annotations.Experimental;
import java.util.Arrays;
import java.util.List;

/**
 * A row of a {@link RecordMerge}: one field and its value in each record (in the records' order).
 *
 * @param chosen the id of the record whose value starts picked; null = the first record with a
 *     non-blank value
 * @param editable whether the row also offers a free-text "custom" value
 */
@Experimental("record merge (3.0-alpha, E2 patterns)")
public record MergeField(
    String fieldId, String label, List<Object> values, String chosen, boolean editable) {

  public MergeField {
    values = values != null ? values : List.of();
  }

  /** A row, nothing pre-picked: {@code MergeField.of("email", "Email", a, b)}. */
  public static MergeField of(String fieldId, String label, Object... values) {
    return new MergeField(fieldId, label, Arrays.asList(values), null, false);
  }

  /** The same row, also offering a free-text value. */
  public MergeField withEditable(boolean editable) {
    return new MergeField(fieldId, label, values, chosen, editable);
  }

  /** The same row, with {@code recordId}'s value picked to begin with. */
  public MergeField withChosen(String recordId) {
    return new MergeField(fieldId, label, values, recordId, editable);
  }
}
