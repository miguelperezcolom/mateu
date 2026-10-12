package io.mateu.uidl.data;

import io.mateu.uidl.annotations.Experimental;
import io.mateu.uidl.fluent.Component;
import java.util.List;
import java.util.Map;
import lombok.Builder;

/**
 * COMPARE AND MERGE: two (or more) records of the same type side by side, one column per record and
 * one row per field, with the rows whose values differ highlighted and a pick per row ("use the
 * value from A") — plus a free edit where a field is {@link MergeField#editable() editable}. A
 * summary of the resulting record sits under the comparison, and the merge button runs {@code
 * mergeActionId} with the chosen values: {@code _merged} (fieldId → value) and {@code _choices}
 * (fieldId → the id of the record it was taken from, or {@code "custom"} when it was typed), next
 * to {@code parameters}.
 *
 * <p>Typical uses: merging duplicate customer profiles, resolving an edit conflict (yours vs. the
 * stored version), reviewing a sync. The picks are client-side state; nothing reaches the server
 * until the merge action runs.
 *
 * @param records the columns, in order (at least two)
 * @param fields the rows; each carries one value per record, in the records' order
 * @param differencesOnly whether the "Show only differences" switch starts on
 * @param mergeLabel the merge button's label; blank = "Merge"
 */
@Experimental("record merge (3.0-alpha, E2 patterns)")
@Builder
public record RecordMerge(
    String id,
    String title,
    List<MergeRecord> records,
    List<MergeField> fields,
    String mergeActionId,
    String mergeLabel,
    Map<String, Object> parameters,
    boolean differencesOnly,
    String style,
    String cssClasses)
    implements Component {

  public RecordMerge {
    records = records != null ? records : List.of();
    fields = fields != null ? fields : List.of();
  }
}
