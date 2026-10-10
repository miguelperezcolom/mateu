package io.mateu.uidl.data;

import io.mateu.uidl.annotations.Experimental;
import lombok.Builder;

/**
 * A cell of a {@link MatrixGrid}: its displayed {@code value}, an optional {@code tone} (info,
 * success, warning, danger, neutral) and whether it is a {@code link} that runs the grid's
 * cellActionId.
 */
@Builder
@Experimental("matrix grid (3.0-alpha.409)")
public record MatrixCell(String value, String tone, boolean link) {

  public static MatrixCell of(Object value) {
    return new MatrixCell(value == null ? "" : String.valueOf(value), null, false);
  }
}
