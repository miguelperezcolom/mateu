package io.mateu.uidl.data;

import io.mateu.uidl.annotations.Experimental;
import java.util.List;
import lombok.Builder;

/** A collapsible group of rows of a {@link MatrixGrid}; {@code collapsed} is its initial state. */
@Builder
@Experimental("matrix grid (since 3.0)")
public record MatrixSection(String id, String title, boolean collapsed, List<MatrixRow> rows) {}
