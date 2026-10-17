package io.mateu.uidl.data;

import io.mateu.uidl.annotations.Experimental;
import lombok.Builder;

/**
 * A column of a {@link RecordMerge}: one of the records being compared. {@code label} names it in
 * the column header and in the picks' accessible names ("Use value from {label} for Email"); {@code
 * caption} is a quieter second line (e.g. "Created 3 Mar 2024 · 12 stays").
 */
@Experimental("record merge (3.0-alpha, E2 patterns)")
@Builder
public record MergeRecord(String id, String label, String caption) {

  public MergeRecord(String id, String label) {
    this(id, label, null);
  }
}
