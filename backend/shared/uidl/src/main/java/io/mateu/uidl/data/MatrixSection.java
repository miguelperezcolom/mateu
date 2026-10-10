package io.mateu.uidl.data;

import java.util.List;
import lombok.Builder;

/** A collapsible group of rows of a {@link MatrixGrid}; {@code collapsed} is its initial state. */
@Builder
public record MatrixSection(String id, String title, boolean collapsed, List<MatrixRow> rows) {}
