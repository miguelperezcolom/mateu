package io.mateu.uidl.data;

import java.util.List;
import lombok.Builder;

/**
 * A row of a {@link MatrixGrid}: one {@link MatrixCell} per column, in column order. {@code
 * editable} lets its cells be edited in place; {@code emphasis} marks a total or key row.
 */
@Builder
public record MatrixRow(
    String id, String label, List<MatrixCell> cells, boolean editable, boolean emphasis) {}
