package io.mateu.uidl.data;

import lombok.Builder;

/**
 * A column of a {@link MatrixGrid}. Consecutive columns sharing a {@code group} (e.g. the month)
 * get a spanning header above theirs; {@code tone} (info, success, warning, danger, neutral) tints
 * the whole column — weekends, a special event.
 */
@Builder
public record MatrixColumn(String id, String label, String group, String tone) {

  public MatrixColumn(String id, String label) {
    this(id, label, null, null);
  }
}
